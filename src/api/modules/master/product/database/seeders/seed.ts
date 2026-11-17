import type { Kysely } from "kysely";
import type { Database } from "../../../../../database/schema.ts";
export const key = "master/product";
export const dependencies: string[] = [
  "common/product-type",
  "common/product-category",
  "common/product-group",
  "common/hsn-code",
  "common/unit",
  "common/tax",
  "common/brand",
];
export const policy = "none";
export async function seed(
  _db: Kysely<Database>,
  _context: { environment: string; demo: boolean; tenantId?: string },
) {
  return { policy, inserted: 0 };
}
