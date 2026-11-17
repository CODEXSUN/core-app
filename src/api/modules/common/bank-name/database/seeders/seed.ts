import { sql, type Kysely } from "kysely";
import type { Database } from "../../../../../database/schema.ts";
import { bankNameValuesSchema } from "../../../../../../../contracts/bank-name.ts";
import { ownerPermissions } from "../../../../../../../contracts/permissions.ts";
import { generateBankNamePublicId } from "../../repository.ts";

export const key = "common/bank-name";
export const dependencies: string[] = [];
export const policy = "reference";
// Reference values adapted from common/contacts/bank-names/bank-names.seed.ts. Placeholder business records are excluded.
const referenceData: Record<string, unknown>[] = [
  {
    name: "State Bank of India",
    sortOrder: 2,
  },
  {
    name: "Bank of Baroda",
    sortOrder: 3,
  },
  {
    name: "Bank of India",
    sortOrder: 4,
  },
  {
    name: "Bank of Maharashtra",
    sortOrder: 5,
  },
  {
    name: "Canara Bank",
    sortOrder: 6,
  },
  {
    name: "Central Bank of India",
    sortOrder: 7,
  },
  {
    name: "Indian Bank",
    sortOrder: 8,
  },
  {
    name: "Indian Overseas Bank",
    sortOrder: 9,
  },
  {
    name: "Punjab & Sind Bank",
    sortOrder: 10,
  },
  {
    name: "Punjab National Bank",
    sortOrder: 11,
  },
  {
    name: "UCO Bank",
    sortOrder: 12,
  },
  {
    name: "Union Bank of India",
    sortOrder: 13,
  },
  {
    name: "Axis Bank Limited",
    sortOrder: 14,
  },
  {
    name: "Bandhan Bank Limited",
    sortOrder: 15,
  },
  {
    name: "CSB Bank Limited",
    sortOrder: 16,
  },
  {
    name: "City Union Bank Limited",
    sortOrder: 17,
  },
  {
    name: "DCB Bank Limited",
    sortOrder: 18,
  },
  {
    name: "Dhanlaxmi Bank Limited",
    sortOrder: 19,
  },
  {
    name: "Federal Bank Limited",
    sortOrder: 20,
  },
  {
    name: "HDFC Bank Limited",
    sortOrder: 21,
  },
  {
    name: "ICICI Bank Limited",
    sortOrder: 22,
  },
  {
    name: "IndusInd Bank Limited",
    sortOrder: 23,
  },
  {
    name: "IDFC FIRST Bank Limited",
    sortOrder: 24,
  },
  {
    name: "Jammu & Kashmir Bank Limited",
    sortOrder: 25,
  },
  {
    name: "Karnataka Bank Limited",
    sortOrder: 26,
  },
  {
    name: "Karur Vysya Bank Limited",
    sortOrder: 27,
  },
  {
    name: "Kotak Mahindra Bank Limited",
    sortOrder: 28,
  },
  {
    name: "Nainital Bank Limited",
    sortOrder: 29,
  },
  {
    name: "RBL Bank Limited",
    sortOrder: 30,
  },
  {
    name: "South Indian Bank Limited",
    sortOrder: 31,
  },
  {
    name: "Tamilnad Mercantile Bank Limited",
    sortOrder: 32,
  },
  {
    name: "YES Bank Limited",
    sortOrder: 33,
  },
  {
    name: "IDBI Bank Limited",
    sortOrder: 34,
  },
  {
    name: "Coastal Local Area Bank Limited",
    sortOrder: 35,
  },
  {
    name: "Krishna Bhima Samruddhi Local Area Bank Limited",
    sortOrder: 36,
  },
  {
    name: "AU Small Finance Bank Limited",
    sortOrder: 37,
  },
  {
    name: "Capital Small Finance Bank Limited",
    sortOrder: 38,
  },
  {
    name: "Equitas Small Finance Bank Limited",
    sortOrder: 39,
  },
  {
    name: "ESAF Small Finance Bank Limited",
    sortOrder: 40,
  },
  {
    name: "Suryoday Small Finance Bank Limited",
    sortOrder: 41,
  },
  {
    name: "Ujjivan Small Finance Bank Limited",
    sortOrder: 42,
  },
  {
    name: "Utkarsh Small Finance Bank Limited",
    sortOrder: 43,
  },
  {
    name: "slice Small Finance Bank Limited",
    sortOrder: 44,
  },
  {
    name: "Jana Small Finance Bank Limited",
    sortOrder: 45,
  },
  {
    name: "Shivalik Small Finance Bank Limited",
    sortOrder: 46,
  },
  {
    name: "Unity Small Finance Bank Limited",
    sortOrder: 47,
  },
  {
    name: "India Post Payments Bank Limited",
    sortOrder: 48,
  },
  {
    name: "Fino Payments Bank Limited",
    sortOrder: 49,
  },
  {
    name: "Airtel Payments Bank Limited",
    sortOrder: 50,
  },
  {
    name: "Jio Payments Bank Limited",
    sortOrder: 51,
  },
  {
    name: "NSDL Payments Bank Limited",
    sortOrder: 52,
  },
  {
    name: "Andhra Pradesh Grameena Bank",
    sortOrder: 53,
  },
  {
    name: "Assam Gramin Bank",
    sortOrder: 54,
  },
  {
    name: "Arunachal Pradesh Rural Bank",
    sortOrder: 55,
  },
  {
    name: "Bihar Gramin Bank",
    sortOrder: 56,
  },
  {
    name: "Chhattisgarh Gramin Bank",
    sortOrder: 57,
  },
  {
    name: "Gujarat Gramin Bank",
    sortOrder: 58,
  },
  {
    name: "Haryana Gramin Bank",
    sortOrder: 59,
  },
  {
    name: "Himachal Pradesh Gramin Bank",
    sortOrder: 60,
  },
  {
    name: "Jharkhand Gramin Bank",
    sortOrder: 61,
  },
  {
    name: "Jammu and Kashmir Grameen Bank",
    sortOrder: 62,
  },
  {
    name: "Karnataka Grameena Bank",
    sortOrder: 63,
  },
  {
    name: "Kerala Grameena Bank",
    sortOrder: 64,
  },
  {
    name: "Maharashtra Gramin Bank",
    sortOrder: 65,
  },
  {
    name: "Madhya Pradesh Gramin Bank",
    sortOrder: 66,
  },
  {
    name: "Manipur Rural Bank",
    sortOrder: 67,
  },
  {
    name: "Meghalaya Rural Bank",
    sortOrder: 68,
  },
  {
    name: "Mizoram Rural Bank",
    sortOrder: 69,
  },
  {
    name: "Nagaland Rural Bank",
    sortOrder: 70,
  },
  {
    name: "Odisha Grameen Bank",
    sortOrder: 71,
  },
  {
    name: "Punjab Gramin Bank",
    sortOrder: 72,
  },
  {
    name: "Puducherry Grama Bank",
    sortOrder: 73,
  },
  {
    name: "Rajasthan Gramin Bank",
    sortOrder: 74,
  },
  {
    name: "Tamil Nadu Grama Bank",
    sortOrder: 75,
  },
  {
    name: "Telangana Grameena Bank",
    sortOrder: 76,
  },
  {
    name: "Tripura Gramin Bank",
    sortOrder: 77,
  },
  {
    name: "Uttar Pradesh Gramin Bank",
    sortOrder: 78,
  },
  {
    name: "Uttarakhand Gramin Bank",
    sortOrder: 79,
  },
  {
    name: "West Bengal Gramin Bank",
    sortOrder: 80,
  },
  {
    name: "AB Bank PLC",
    sortOrder: 81,
  },
  {
    name: "American Express Banking Corporation",
    sortOrder: 82,
  },
  {
    name: "Australia and New Zealand Banking Group Limited",
    sortOrder: 83,
  },
  {
    name: "Barclays Bank PLC",
    sortOrder: 84,
  },
  {
    name: "Bank of America, National Association",
    sortOrder: 85,
  },
  {
    name: "Bank of Bahrain and Kuwait B.S.C.",
    sortOrder: 86,
  },
  {
    name: "Bank of Ceylon",
    sortOrder: 87,
  },
  {
    name: "Bank of China Limited",
    sortOrder: 88,
  },
  {
    name: "Bank of Nova Scotia",
    sortOrder: 89,
  },
  {
    name: "BNP Paribas",
    sortOrder: 90,
  },
  {
    name: "Citibank N.A.",
    sortOrder: 91,
  },
  {
    name: "Cooperatieve Rabobank U.A.",
    sortOrder: 92,
  },
  {
    name: "Credit Agricole Corporate and Investment Bank",
    sortOrder: 93,
  },
  {
    name: "CTBC Bank Co., Limited",
    sortOrder: 94,
  },
  {
    name: "DBS Bank India Limited",
    sortOrder: 95,
  },
  {
    name: "Deutsche Bank A.G.",
    sortOrder: 96,
  },
  {
    name: "Doha Bank Q.P.S.C.",
    sortOrder: 97,
  },
  {
    name: "Emirates NBD Bank P.J.S.C.",
    sortOrder: 98,
  },
  {
    name: "First Abu Dhabi Bank PJSC",
    sortOrder: 99,
  },
  {
    name: "FirstRand Bank Limited",
    sortOrder: 100,
  },
  {
    name: "Hong Kong and Shanghai Banking Corporation Limited",
    sortOrder: 101,
  },
  {
    name: "Industrial and Commercial Bank of China Limited",
    sortOrder: 102,
  },
  {
    name: "Industrial Bank of Korea",
    sortOrder: 103,
  },
  {
    name: "J.P. Morgan Chase Bank N.A.",
    sortOrder: 104,
  },
  {
    name: "JSC VTB Bank",
    sortOrder: 105,
  },
  {
    name: "KEB Hana Bank",
    sortOrder: 106,
  },
  {
    name: "Kookmin Bank",
    sortOrder: 107,
  },
  {
    name: "Mashreqbank P.S.C.",
    sortOrder: 108,
  },
  {
    name: "Mizuho Bank Limited",
    sortOrder: 109,
  },
  {
    name: "MUFG Bank, Limited",
    sortOrder: 110,
  },
  {
    name: "NatWest Markets PLC",
    sortOrder: 111,
  },
  {
    name: "NongHyup Bank",
    sortOrder: 112,
  },
  {
    name: "PT Bank Maybank Indonesia TBK",
    sortOrder: 113,
  },
  {
    name: "Qatar National Bank Q.P.S.C.",
    sortOrder: 114,
  },
  {
    name: "Sberbank",
    sortOrder: 115,
  },
  {
    name: "SBM Bank (India) Limited",
    sortOrder: 116,
  },
  {
    name: "Shinhan Bank",
    sortOrder: 117,
  },
  {
    name: "Societe Generale",
    sortOrder: 118,
  },
  {
    name: "Sonali Bank PLC",
    sortOrder: 119,
  },
  {
    name: "Standard Chartered Bank",
    sortOrder: 120,
  },
  {
    name: "Sumitomo Mitsui Banking Corporation",
    sortOrder: 121,
  },
  {
    name: "United Overseas Bank Limited",
    sortOrder: 122,
  },
  {
    name: "UBS AG",
    sortOrder: 123,
  },
  {
    name: "Woori Bank",
    sortOrder: 124,
  },
  {
    name: "Andaman and Nicobar State Co-operative Bank Limited",
    sortOrder: 125,
  },
  {
    name: "Andhra Pradesh State Co-operative Bank Limited",
    sortOrder: 126,
  },
  {
    name: "Arunachal Pradesh State Co-operative Apex Bank Limited",
    sortOrder: 127,
  },
  {
    name: "Assam Co-operative Apex Bank Limited",
    sortOrder: 128,
  },
  {
    name: "Bihar State Co-operative Bank Limited",
    sortOrder: 129,
  },
  {
    name: "Chandigarh State Co-operative Bank Limited",
    sortOrder: 130,
  },
  {
    name: "Chhattisgarh Rajya Sahakari Bank Maryadit",
    sortOrder: 131,
  },
  {
    name: "Delhi State Co-operative Bank Limited",
    sortOrder: 132,
  },
  {
    name: "Goa State Co-operative Bank Limited",
    sortOrder: 133,
  },
  {
    name: "Gujarat State Co-operative Bank Limited",
    sortOrder: 134,
  },
  {
    name: "Haryana State Co-operative Apex Bank Limited",
    sortOrder: 135,
  },
  {
    name: "Himachal Pradesh State Co-operative Bank Limited",
    sortOrder: 136,
  },
  {
    name: "Jammu and Kashmir State Co-operative Bank Limited",
    sortOrder: 137,
  },
  {
    name: "Jharkhand State Co-operative Bank Limited",
    sortOrder: 138,
  },
  {
    name: "Karnataka State Co-operative Apex Bank Limited",
    sortOrder: 139,
  },
  {
    name: "Kerala State Co-operative Bank Limited",
    sortOrder: 140,
  },
  {
    name: "Madhya Pradesh Rajya Sahakari Bank Maryadit",
    sortOrder: 141,
  },
  {
    name: "Maharashtra State Co-operative Bank Limited",
    sortOrder: 142,
  },
  {
    name: "Manipur State Co-operative Bank Limited",
    sortOrder: 143,
  },
  {
    name: "Meghalaya Co-operative Apex Bank Limited",
    sortOrder: 144,
  },
  {
    name: "Mizoram Co-operative Apex Bank Limited",
    sortOrder: 145,
  },
  {
    name: "Nagaland State Co-operative Bank Limited",
    sortOrder: 146,
  },
  {
    name: "Odisha State Co-operative Bank Limited",
    sortOrder: 147,
  },
  {
    name: "Puducherry State Co-operative Bank Limited",
    sortOrder: 148,
  },
  {
    name: "Punjab State Co-operative Bank Limited",
    sortOrder: 149,
  },
  {
    name: "Rajasthan State Co-operative Bank Limited",
    sortOrder: 150,
  },
  {
    name: "Sikkim State Co-operative Bank Limited",
    sortOrder: 151,
  },
  {
    name: "Tamil Nadu State Apex Co-operative Bank Limited",
    sortOrder: 152,
  },
  {
    name: "Telangana State Cooperative Apex Bank Limited",
    sortOrder: 153,
  },
  {
    name: "Tripura State Co-operative Bank Limited",
    sortOrder: 154,
  },
  {
    name: "Uttar Pradesh Co-operative Bank Limited",
    sortOrder: 155,
  },
  {
    name: "Uttarakhand State Co-operative Bank Limited",
    sortOrder: 156,
  },
  {
    name: "West Bengal State Co-operative Bank Limited",
    sortOrder: 157,
  },
  {
    name: "Daman and Diu State Co-operative Bank Limited",
    sortOrder: 158,
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

          const values = bankNameValuesSchema.parse({
            name: source.name,
            active: true,
            sortOrder: source.sortOrder,
          });
          const existing = await transaction
            .selectFrom("bank_names")
            .select("id")
            .where("tenant_id", "=", scope.tenantId)
            .where(sql`lower(trim(name))`, "=", values.name.toLowerCase())
            .executeTakeFirst();
          if (existing) return false;
          await transaction
            .insertInto("bank_names")
            .values({
              public_id: generateBankNamePublicId(),
              tenant_id: scope.tenantId,
              name: values.name,
              active: true,
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
          failure.constraint !== "bank_names_public_id_unique" ||
          attempt === 4
        )
          throw error;
      }
    }
  }
  return { policy, inserted, available: referenceData.length };
}
