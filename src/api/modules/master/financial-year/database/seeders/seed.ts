import type { Kysely } from "kysely";
import type { Database } from "../../../../../database/schema.ts";

export const key = "master/financial-year";
export const dependencies: string[] = [];
export const policy = "none";

export async function seed(
  _db: Kysely<Database>,
  _context: { environment: string; demo: boolean },
) {
  // Add reviewed reference/bootstrap data here, never in a grouped app seed file.
  return {
    policy,
    inserted: 0,
    skipped: "This module has no required seed data.",
  };
}
