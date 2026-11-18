import test from "node:test";
import assert from "node:assert/strict";
import {
  legacyContactValuesSchema,
  createLegacyContactPort,
} from "../contracts/legacy-contact-port.ts";
const values = {
  name: "Customer",
  code: "",
  legalName: "",
  typeId: "type0001",
  groupId: "",
  gstin: "",
  pan: "",
  msmeNo: "",
  msmeCategory: "",
  tanNo: "",
  tdsAvailable: false,
  tcsAvailable: false,
  openingBalance: "0.00",
  creditLimit: "0.00",
  website: "",
  description: "",
  active: true,
  phones: [{ phone: "9876500001", phoneType: "Mobile", isPrimary: true }],
  emails: [],
  addresses: [],
  bankAccounts: [],
  socialLinks: [],
};
test("legacy contact contract validates primary choices, mobile identity, exact amounts and protected fields", () => {
  assert.ok(legacyContactValuesSchema.safeParse(values).success);
  for (const changed of [
    { ...values, createdBy: "forged" },
    { ...values, creditLimit: "1.001" },
    { ...values, phones: [] },
    {
      ...values,
      phones: [
        ...values.phones,
        { phone: "9876500001", phoneType: "Other", isPrimary: false },
      ],
    },
    { ...values, website: "javascript:alert(1)" },
  ])
    assert.equal(legacyContactValuesSchema.safeParse(changed).success, false);
});
test("public legacy contact port refuses another tenant and missing operation authorization before SQL", async () => {
  let queries = 0;
  const tx = {
    async query<T>(): Promise<T[]> {
      queries++;
      return [];
    },
  };
  const other = createLegacyContactPort(tx, {
    tenantId: "tenant01",
    boundTenantId: "tenant02",
    actorEmail: "staff@example.test",
    authorize: () => {},
  });
  await assert.rejects(other.get("contact1"), { statusCode: 403 });
  const denied = createLegacyContactPort(tx, {
    tenantId: "tenant01",
    boundTenantId: "tenant01",
    actorEmail: "staff@example.test",
    authorize: () => {
      throw Object.assign(Error("Denied"), { statusCode: 403 });
    },
  });
  await assert.rejects(denied.save(values), { statusCode: 403 });
  assert.equal(queries, 0);
});
