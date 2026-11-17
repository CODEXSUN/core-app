import { companyValuesSchema } from "../contracts/company.ts";
import { contactValuesSchema } from "../contracts/contact.ts";
import assert from "node:assert/strict";
import { randomBytes, createHash } from "node:crypto";
import path from "node:path";
import { sql } from "kysely";
import { openDatabase } from "../src/api/database/connection.ts";
import { migrate, createMigrator } from "../src/api/database/migrate.ts";
import { seedModules } from "../src/api/database/seed.ts";
import { createApplication } from "../src/api/app.ts";
import { ownerPermissions } from "../src/api/auth.ts";

export const companyValues = companyValuesSchema.parse({
  name: "Test Company",
  code: "COMP-1",
  legalName: "Test Company Ltd",
  gstin: "",
  pan: "",
  website: "",
  description: "",
  emails: [],
  phones: [],
  addresses: [],
  active: true,
});
export const contactValues = contactValuesSchema.parse({
  name: "Test Customer",
  code: "CONTACT-1",
  role: "customer",
  active: true,
});
export const financialYearValues = {
  name: "2026-27",
  startDate: "2026-04-01",
  endDate: "2027-03-31",
  isCurrent: true,
  active: true,
};

export async function withTestDatabase(
  run: (resources: {
    db: ReturnType<typeof openDatabase>;
    app: ReturnType<typeof createApplication>;
    headersA: { authorization: string };
    headersB: { authorization: string };
    reader: { authorization: string };
  }) => Promise<void>,
  options: { existingBaseline?: boolean } = {},
) {
  assert.equal(process.env.NODE_ENV, "test");
  const value = process.env.CORE_APP_DATABASE_URL;
  assert.ok(
    value && new URL(value).pathname.endsWith("_test"),
    "Use an explicitly configured disposable *_test database.",
  );
  const schema = "core_test_" + randomBytes(8).toString("hex");
  const admin = openDatabase(process.env);
  await admin.schema.createSchema(schema).execute();
  const url = new URL(value);
  url.searchParams.set("options", "-c search_path=" + schema);
  const db = openDatabase({ ...process.env, CORE_APP_DATABASE_URL: url.href });
  const tokenA = randomBytes(32).toString("hex"),
    tokenB = randomBytes(32).toString("hex"),
    readToken = randomBytes(32).toString("hex");
  const client = (
    token: string,
    tenantId: string,
    permissions: readonly string[],
  ) => ({
    tokenHash: createHash("sha256").update(token).digest("hex"),
    tenantId,
    actorId: "test:verified-actor",
    permissions,
  });
  const app = createApplication(db, {
    NODE_ENV: "test",
    CORE_APP_API_CLIENTS: JSON.stringify([
      client(tokenA, "tenant-a", ownerPermissions),
      client(tokenB, "tenant-b", ownerPermissions),
      client(
        readToken,
        "tenant-a",
        ownerPermissions.filter((value) => value.endsWith(":read")),
      ),
    ]),
  });
  const modules = path.resolve("src/api/modules");
  try {
    if (options.existingBaseline) {
      const baseline = await createMigrator(db, modules).migrateTo(
        "20261117081721_contact_create_contacts",
      );
      assert.ok(!baseline.error);
      await sql`insert into companies (public_id,tenant_id,name,code,legal_name,gstin,pan,website,description,emails,phones,addresses,created_by,updated_by)
        values ('legacy01','tenant-a','Legacy company','LEGACY','','','','','','[]'::jsonb,'[]'::jsonb,'[]'::jsonb,'legacy:actor','legacy:actor')`.execute(
        db,
      );
      await sql`insert into contacts (public_id,tenant_id,name,code,legal_name,role,gstin,pan,website,description,emails,phones,addresses,created_by,updated_by)
        values ('legacy02','tenant-a','Legacy contact','LEGACY','','customer','','','','','[]'::jsonb,'[]'::jsonb,'[]'::jsonb,'legacy:actor','legacy:actor')`.execute(
        db,
      );
    }
    assert.equal(
      (await migrate(db, modules, "up")).length,
      options.existingBaseline ? 37 : 40,
    );
    assert.equal((await migrate(db, modules, "up")).length, 0);
    await seedModules(db, modules, { environment: "test", demo: false });
    await seedModules(db, modules, { environment: "test", demo: false });
    assert.equal(
      (await db.selectFrom("companies").selectAll().execute()).length,
      options.existingBaseline ? 1 : 0,
    );
    assert.equal(
      (await db.selectFrom("financial_years").selectAll().execute()).length,
      0,
    );
    assert.equal(
      (await db.selectFrom("contacts").selectAll().execute()).length,
      options.existingBaseline ? 1 : 0,
    );
    await assert.rejects(
      seedModules(db, modules, { environment: "production", demo: true }),
      /forbidden/,
    );
    await run({
      db,
      app,
      headersA: { authorization: "Bearer " + tokenA },
      headersB: { authorization: "Bearer " + tokenB },
      reader: { authorization: "Bearer " + readToken },
    });
    // Additive upgrades intentionally refuse destructive rollback; test schemas are disposed below.
  } finally {
    await app.close();
    await db.destroy();
    await admin.schema.dropSchema(schema).cascade().execute();
    await admin.destroy();
  }
}
