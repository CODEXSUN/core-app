import { pathToFileURL } from "node:url";
import type { Kysely } from "kysely";
import { discoverModuleFiles } from "./discovery.ts";

type Seeder = {
  key: string;
  dependencies: string[];
  policy: string;
  seed: (
    db: Kysely<any>,
    context: { environment: string; demo: boolean; tenantId?: string },
  ) => Promise<unknown>;
};

export async function seedModules(
  db: Kysely<any>,
  root: string,
  context: { environment: string; demo: boolean; tenantId?: string },
) {
  if (context.tenantId && !/^[a-zA-Z0-9:._-]{1,128}$/.test(context.tenantId))
    throw new Error("Invalid seed tenant.");
  if (context.demo && context.environment === "production")
    throw new Error("Demo seeds are forbidden in production.");
  const pending = new Map<string, Seeder>();
  for (const file of await discoverModuleFiles(root, "seeders")) {
    const seeder: Seeder = await import(pathToFileURL(file).href);
    if (
      !seeder.key ||
      pending.has(seeder.key) ||
      !Array.isArray(seeder.dependencies) ||
      typeof seeder.seed !== "function" ||
      !["demo", "reference", "bootstrap", "none"].includes(seeder.policy)
    ) {
      throw new Error("Invalid or duplicate module seeder.");
    }
    pending.set(seeder.key, seeder);
  }
  // Resolve the complete plan before executing anything; reject missing/cyclic dependencies.
  const plan: Seeder[] = [];
  const done = new Set<string>();
  while (pending.size) {
    const next = [...pending.values()].find((seed) =>
      seed.dependencies.every((key) => done.has(key)),
    );
    if (!next) throw new Error("Missing or cyclic seeder dependency.");
    pending.delete(next.key);
    done.add(next.key);
    plan.push(next);
  }
  const results = [];
  for (const seeder of plan)
    results.push({
      module: seeder.key,
      result: await seeder.seed(db, context),
    });
  return results;
}
