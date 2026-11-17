import { readdir } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import type { Migration } from "kysely/migration";

export async function discoverModuleFiles(
  root: string,
  kind: "migrations" | "seeders",
) {
  const files: string[] = [];
  async function visit(directory: string) {
    for (const entry of await readdir(directory, { withFileTypes: true })) {
      if (entry.isSymbolicLink())
        throw new Error("Linked module files are not supported.");
      const location = path.join(directory, entry.name);
      if (entry.isDirectory()) await visit(location);
      else if (
        entry.isFile() &&
        path.basename(directory) === kind &&
        path.basename(path.dirname(directory)) === "database" &&
        /\.(ts|js)$/.test(entry.name) &&
        (kind === "migrations" || /^seed\.(ts|js)$/.test(entry.name))
      ) {
        files.push(location);
      }
    }
  }
  await visit(root);
  return files.sort();
}

export async function loadMigrations(
  root: string,
): Promise<Record<string, Migration>> {
  const migrations: Record<string, Migration> = {};
  for (const file of await discoverModuleFiles(root, "migrations")) {
    const name = path.basename(file).replace(/\.(ts|js)$/, "");
    if (!/^\d{14}_[a-z0-9_]+$/.test(name) || name in migrations) {
      throw new Error("Duplicate or invalid migration name.");
    }
    const migration = await import(pathToFileURL(file).href);
    if (typeof migration.up !== "function")
      throw new Error("Migration must export up.");
    migrations[name] = migration;
  }
  return migrations;
}
