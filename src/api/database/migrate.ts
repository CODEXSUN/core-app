import { Migrator } from "kysely/migration";
import type { Kysely } from "kysely";
import { loadMigrations } from "./discovery.ts";

export function createMigrator(db: Kysely<any>, moduleRoot: string) {
  return new Migrator({
    db,
    provider: { getMigrations: () => loadMigrations(moduleRoot) },
  });
}

export async function migrate(
  db: Kysely<any>,
  moduleRoot: string,
  direction: "up" | "down",
) {
  const migrator = createMigrator(db, moduleRoot);
  const result =
    direction === "up"
      ? await migrator.migrateToLatest()
      : await migrator.migrateDown();
  if (result.error)
    throw new Error(
      "Migration failed. Inspect schema/history before retrying.",
    );
  return result.results ?? [];
}
