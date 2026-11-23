import { Migrator } from "kysely/migration";
import { sql, type Kysely } from "kysely";
import { loadMigrations } from "./discovery.ts";

export async function createMigrator(db: Kysely<any>, moduleRoot: string) {
  const result = await sql<{
    schema: string;
  }>`select current_schema() as schema`.execute(db);
  const schema = result.rows[0]?.schema;
  if (!schema) throw new Error("A database schema is required.");
  return new Migrator({
    db,
    migrationTableSchema: schema,
    provider: { getMigrations: () => loadMigrations(moduleRoot) },
  });
}

export async function migrate(
  db: Kysely<any>,
  moduleRoot: string,
  direction: "up" | "down",
) {
  const migrator = await createMigrator(db, moduleRoot);
  const result =
    direction === "up"
      ? await migrator.migrateToLatest()
      : await migrator.migrateDown();
  if (result.error)
    throw new Error(
      "Migration failed. Inspect schema/history before retrying.",
      { cause: result.error },
    );
  return result.results ?? [];
}
