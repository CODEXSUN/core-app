import { sql, type Kysely } from "kysely";
import type { Database } from "../../../../../database/schema.ts";
import { pincodeValuesSchema } from "../../../../../../../contracts/pincode.ts";
import { ownerPermissions } from "../../../../../../../contracts/permissions.ts";
import { generatePincodePublicId } from "../../repository.ts";
import {
  listCityRecords,
  resolveCityReference,
} from "../../../../common/city/index.ts";
export const key = "common/pincode";
export const dependencies: string[] = ["common/city"];
export const policy = "reference";
// Reference values adapted from common/location/pincode/pincode.seed.ts. Placeholder business records are excluded.
const referenceData: Record<string, unknown>[] = [
  {
    code: "641601",
    areaName: "Tiruppur North",
    cityName: "Tiruppur",
    sortOrder: 1,
    status: "active",
    name: "641601",
  },
  {
    code: "641602",
    areaName: "Tiruppur Bazaar",
    cityName: "Tiruppur",
    sortOrder: 2,
    status: "active",
    name: "641602",
  },
  {
    code: "641603",
    areaName: "Tiruppur South",
    cityName: "Tiruppur",
    sortOrder: 3,
    status: "active",
    name: "641603",
  },
  {
    code: "641604",
    areaName: "Tiruppur Cotton Market",
    cityName: "Tiruppur",
    sortOrder: 4,
    status: "active",
    name: "641604",
  },
  {
    code: "641605",
    areaName: "Veerapandi",
    cityName: "Tiruppur",
    sortOrder: 5,
    status: "active",
    name: "641605",
  },
  {
    code: "641606",
    areaName: "Vijayapuram",
    cityName: "Tiruppur",
    sortOrder: 6,
    status: "active",
    name: "641606",
  },
  {
    code: "641607",
    areaName: "P.N. Road",
    cityName: "Tiruppur",
    sortOrder: 7,
    status: "active",
    name: "641607",
  },
  {
    code: "641652",
    areaName: "Avinashi",
    cityName: "Tiruppur",
    sortOrder: 8,
    status: "active",
    name: "641652",
  },
  {
    code: "642126",
    areaName: "Udumalpet",
    cityName: "Tiruppur",
    sortOrder: 9,
    status: "active",
    name: "642126",
  },
  {
    code: "641001",
    areaName: "Coimbatore Head Post Office",
    cityName: "Coimbatore",
    sortOrder: 20,
    status: "active",
    name: "641001",
  },
  {
    code: "641002",
    areaName: "R.S. Puram",
    cityName: "Coimbatore",
    sortOrder: 21,
    status: "active",
    name: "641002",
  },
  {
    code: "641004",
    areaName: "Peelamedu",
    cityName: "Coimbatore",
    sortOrder: 22,
    status: "active",
    name: "641004",
  },
  {
    code: "641006",
    areaName: "Ganapathy",
    cityName: "Coimbatore",
    sortOrder: 23,
    status: "active",
    name: "641006",
  },
  {
    code: "641012",
    areaName: "Tatabad",
    cityName: "Coimbatore",
    sortOrder: 24,
    status: "active",
    name: "641012",
  },
  {
    code: "641018",
    areaName: "Race Course",
    cityName: "Coimbatore",
    sortOrder: 25,
    status: "active",
    name: "641018",
  },
  {
    code: "641035",
    areaName: "Saravanampatti",
    cityName: "Coimbatore",
    sortOrder: 26,
    status: "active",
    name: "641035",
  },
  {
    code: "641041",
    areaName: "Vadavalli",
    cityName: "Coimbatore",
    sortOrder: 27,
    status: "active",
    name: "641041",
  },
  {
    code: "642001",
    areaName: "Pollachi",
    cityName: "Coimbatore",
    sortOrder: 28,
    status: "active",
    name: "642001",
  },
  {
    code: "600001",
    areaName: "Chennai GPO",
    cityName: "Chennai",
    sortOrder: 40,
    status: "active",
    name: "600001",
  },
  {
    code: "600002",
    areaName: "Anna Road",
    cityName: "Chennai",
    sortOrder: 41,
    status: "active",
    name: "600002",
  },
  {
    code: "600004",
    areaName: "Mylapore",
    cityName: "Chennai",
    sortOrder: 42,
    status: "active",
    name: "600004",
  },
  {
    code: "600017",
    areaName: "T. Nagar",
    cityName: "Chennai",
    sortOrder: 43,
    status: "active",
    name: "600017",
  },
  {
    code: "600020",
    areaName: "Adyar",
    cityName: "Chennai",
    sortOrder: 44,
    status: "active",
    name: "600020",
  },
  {
    code: "600028",
    areaName: "Raja Annamalaipuram",
    cityName: "Chennai",
    sortOrder: 45,
    status: "active",
    name: "600028",
  },
  {
    code: "600032",
    areaName: "Guindy",
    cityName: "Chennai",
    sortOrder: 46,
    status: "active",
    name: "600032",
  },
  {
    code: "600042",
    areaName: "Velachery",
    cityName: "Chennai",
    sortOrder: 47,
    status: "active",
    name: "600042",
  },
  {
    code: "600100",
    areaName: "Pallikaranai",
    cityName: "Chennai",
    sortOrder: 48,
    status: "active",
    name: "600100",
  },
];
export async function seed(
  db: Kysely<Database>,
  context: { environment: string; demo: boolean; tenantId?: string },
) {
  if (!context.tenantId)
    return {
      policy,
      inserted: 0,
      available: referenceData.length,
      skipped: "Supply an explicit tenant to install reference data.",
    };
  const scope = {
    tenantId: context.tenantId,
    actorId: "system:core-reference-seed",
    permissions: ownerPermissions,
  };
  let inserted = 0;
  for (const source of referenceData) {
    for (let attempt = 0; attempt < 5; attempt++) {
      try {
        const added = await db.transaction().execute(async (transaction) => {
          await sql`select pg_advisory_xact_lock(hashtextextended(${scope.tenantId + ":reference-seed"},0))`.execute(
            transaction,
          );
          const candidates = await listCityRecords(transaction, scope);
          const selected = candidates.find(
            (row) => row.name === source.cityName,
          );
          if (!selected) throw new Error("Seed dependency city is missing.");
          const cityId = await resolveCityReference(
            transaction,
            scope,
            selected.public_id,
          );
          const values = pincodeValuesSchema.parse({
            name: source.name,
            active: true,
            cityId: cityId.public_id,
            area: source.area,
            sortOrder: source.sortOrder,
          });
          const existing = await transaction
            .selectFrom("pincodes")
            .select("id")
            .where("tenant_id", "=", scope.tenantId)
            .where(sql`lower(trim(name))`, "=", values.name.toLowerCase())
            .where("city_id", "=", cityId.id)
            .executeTakeFirst();
          if (existing) return false;
          await transaction
            .insertInto("pincodes")
            .values({
              public_id: generatePincodePublicId(),
              tenant_id: scope.tenantId,
              name: values.name,
              active: true,
              city_id: cityId.id,
              area: values.area,
              sort_order: values.sortOrder,
              created_by: scope.actorId,
              updated_by: scope.actorId,
              deleted_at: null,
              deleted_by: null,
            })
            .execute();
          return true;
        });
        if (added) inserted++;
        break;
      } catch (error) {
        const failure = error as { code?: string; constraint?: string };
        if (
          failure.code !== "23505" ||
          failure.constraint !== "pincodes_public_id_unique" ||
          attempt === 4
        )
          throw error;
      }
    }
  }
  return { policy, inserted, available: referenceData.length };
}
