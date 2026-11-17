import { Kysely, PostgresDialect } from "kysely";
import pg from "pg";
import { appDetails } from "../../../contracts/app.ts";
import type { Database } from "./schema.ts";

export function openDatabase(values: NodeJS.ProcessEnv) {
  const connectionString = values[`${appDetails.prefix}_DATABASE_URL`];
  if (!connectionString)
    throw new Error(
      "Configure the application DATABASE_URL before using database modules.",
    );
  const pool = new pg.Pool({
    connectionString,
    max: 5,
    // Financial-year boundaries are calendar dates, never timezone timestamps.
    types: {
      getTypeParser: (oid: number, format?: "text" | "binary") =>
        oid === 1082
          ? (value: string) => value
          : pg.types.getTypeParser(oid, format),
    },
    connectionTimeoutMillis: 3000,
    statement_timeout: 10000,
  });
  // Idle connections can fail outside a request. Keep the process alive for recovery.
  pool.on("error", () => {
    console.error("Database connection interrupted.");
  });
  return new Kysely<Database>({ dialect: new PostgresDialect({ pool }) });
}
