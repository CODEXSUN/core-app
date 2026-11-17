import type { Kysely } from "kysely";
import type { Database } from "../../../../../database/schema.ts";
export const key = "master/default-company";
export const dependencies: string[] = [
  "master/company",
  "master/financial-year",
];
export const policy = "none";
export async function seed(
  _db: Kysely<Database>,
  _context: { environment: string; demo: boolean; tenantId?: string },
) {
  return { policy, inserted: 0 };
}
