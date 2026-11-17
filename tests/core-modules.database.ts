import test from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { sql } from "kysely";
import { withTestDatabase } from "./database-harness.ts";
import { coreCases } from "./core-module-cases.ts";
import { seedModules } from "../src/api/database/seed.ts";
import { createMigrator, migrate } from "../src/api/database/migrate.ts";

test("all 37 Core modules, references, seeds and upgrade recovery", async (t) => {
  await withTestDatabase(async ({ db, app, headersA, headersB, reader }) => {
    const records = new Map<string, Record<string, any>>();
    const inputs = new Map<string, Record<string, unknown>>();
    for (const module of coreCases) {
      await t.test(module.label, async () => {
        const url = "/api/v1/" + module.collection;
        const values: Record<string, unknown> = { ...module.values };
        for (const reference of module.refs)
          values[reference.field] = records.get(reference.target)?.public_id;
        inputs.set(module.name, values);
        assert.equal((await app.inject(url)).statusCode, 401);
        assert.equal(
          (
            await app.inject({
              method: "POST",
              url,
              headers: reader,
              payload: values,
            })
          ).statusCode,
          403,
        );
        assert.equal(
          (
            await app.inject({
              method: "POST",
              url,
              headers: headersA,
              payload: { ...values, created_by: "forged" },
            })
          ).statusCode,
          400,
        );
        const result = await app.inject({
          method: "POST",
          url,
          headers: headersA,
          payload: values,
        });
        assert.equal(result.statusCode, 201, result.body);
        const record = result.json();
        records.set(module.name, record);
        assert.match(record.public_id, /^[a-z0-9]{8}$/);
        assert.equal(record.created_by, "test:verified-actor");
        assert.ok(!("id" in record) && !("tenant_id" in record));
        const detail = await app.inject({
          url: url + "/" + record.public_id,
          headers: headersA,
        });
        assert.equal(detail.statusCode, 200);
        assert.equal(
          (
            await app.inject({
              url: url + "/" + record.public_id,
              headers: headersB,
            })
          ).statusCode,
          404,
        );
        assert.equal(
          (
            await app.inject({
              method: "PATCH",
              url: url + "/" + record.public_id,
              headers: headersB,
              payload: values,
            })
          ).statusCode,
          404,
        );
        if (module.refs.length)
          assert.equal(
            (
              await app.inject({
                method: "POST",
                url,
                headers: headersB,
                payload: values,
              })
            ).statusCode,
            409,
            "Foreign tenant references must be rejected",
          );
        const edited = await app.inject({
          method: "PATCH",
          url: url + "/" + record.public_id,
          headers: headersA,
          payload: { ...values, active: false },
        });
        assert.equal(edited.statusCode, 200, edited.body);
        assert.equal(edited.json().active, false);
        const restored = await app.inject({
          method: "PATCH",
          url: url + "/" + record.public_id,
          headers: headersA,
          payload: values,
        });
        assert.equal(restored.statusCode, 200, restored.body);
        for (const reference of module.refs) {
          assert.equal(
            restored.json()[reference.field],
            values[reference.field],
          );
          assert.ok(restored.json()[reference.field.slice(0, -2) + "Name"]);
        }
        assert.equal(
          (await app.inject({ url: url + "/not-an-id", headers: headersA }))
            .statusCode,
          400,
        );
        assert.equal(
          (
            await app.inject({
              method: "DELETE",
              url: url + "/" + record.public_id,
              headers: headersA,
            })
          ).statusCode,
          404,
        );
      });
    }
    await t.test(
      "database tenant-safe foreign keys and protected default selections",
      async () => {
        const country = await db
          .selectFrom("countries")
          .selectAll()
          .where("public_id", "=", String(records.get("country")!.public_id))
          .executeTakeFirstOrThrow();
        await assert.rejects(
          sql`insert into states (public_id,tenant_id,name,country_id,code,sort_order,created_by,updated_by)
        values ('foreign1','tenant-b','Wrong scope',${country.id},'BAD',0,'test','test')`.execute(
            db,
          ),
          (error) => (error as { code?: string }).code === "23503",
        );
        for (const name of ["company", "financial-year"]) {
          const collection =
            name === "company" ? "companies" : "financial-years";
          const response = await app.inject({
            method: "PATCH",
            url: "/api/v1/" + collection + "/" + records.get(name)!.public_id,
            headers: headersA,
            payload: { ...inputs.get(name), active: false },
          });
          assert.equal(response.statusCode, 409, response.body);
        }
        const badProduct = await app.inject({
          method: "POST",
          url: "/api/v1/products",
          headers: headersA,
          payload: {
            ...inputs.get("product"),
            name: "Unknown unit",
            unitId: "zzzzzzzz",
          },
        });
        assert.equal(badProduct.statusCode, 409);
        assert.equal(records.get("product")!.taxRate, "18.1234");
        assert.equal(records.get("product")!.hsnCode, "1234");
        const context = await app.inject({
          url: "/api/v1/organisation-context",
          headers: reader,
        });
        assert.equal(context.statusCode, 200, context.body);
        assert.equal(
          context.json().company.public_id,
          records.get("company")!.public_id,
        );
        assert.equal(
          context.json().financialYear.public_id,
          records.get("financial-year")!.public_id,
        );
        assert.ok(
          !("id" in context.json().company) &&
            !("id" in context.json().financialYear),
        );
        assert.equal(
          (
            await app.inject({
              url: "/api/v1/organisation-context",
              headers: headersB,
            })
          ).statusCode,
          404,
        );
        const invalidRate = await app.inject({
          method: "POST",
          url: "/api/v1/taxes",
          headers: headersA,
          payload: {
            ...inputs.get("tax"),
            name: "Invalid",
            ratePercent: "100.0001",
          },
        });
        assert.equal(invalidRate.statusCode, 400);
        const unsafeAddress = await app.inject({
          method: "POST",
          url: "/api/v1/contacts",
          headers: headersA,
          payload: {
            ...inputs.get("contact"),
            code: "BAD-ADDRESS",
            addresses: [
              {
                label: "billing",
                addressLine1: "Test",
                country: "Test",
                countryId: records.get("country")!.public_id,
                stateId: "zzzzzzzz",
                isDefault: true,
              },
            ],
          },
        });
        assert.equal(unsafeAddress.statusCode, 409);
      },
    );
    await t.test(
      "all tenant reference seeds rerun without replacing data or identities",
      async () => {
        const root = path.resolve("src/api/modules");
        const first = await seedModules(db, root, {
          environment: "test",
          demo: false,
          tenantId: "tenant-a",
        });
        assert.ok(
          first.some(
            (value) => (value.result as { inserted: number }).inserted > 0,
          ),
        );
        const unit = await db
          .selectFrom("units")
          .selectAll()
          .where("tenant_id", "=", "tenant-a")
          .where("name", "=", "pcs")
          .executeTakeFirstOrThrow();
        await db
          .updateTable("units")
          .set({ active: false, updated_by: "test:customised" })
          .where("id", "=", unit.id)
          .execute();
        const repeated = await seedModules(db, root, {
          environment: "test",
          demo: false,
          tenantId: "tenant-a",
        });
        assert.ok(
          repeated.every(
            (value) => (value.result as { inserted: number }).inserted === 0,
          ),
        );
        const preserved = await db
          .selectFrom("units")
          .selectAll()
          .where("id", "=", unit.id)
          .executeTakeFirstOrThrow();
        assert.equal(preserved.active, false);
        assert.equal(preserved.updated_by, "test:customised");
        const hyphen = await app.inject({
          url: "/api/v1/units",
          headers: headersA,
        });
        const protectedUnit = hyphen
          .json()
          .find((row: { name: string }) => row.name === "-");
        assert.equal(
          (
            await app.inject({
              method: "PATCH",
              url: "/api/v1/units/" + protectedUnit.public_id,
              headers: headersA,
              payload: { name: "Renamed", sortOrder: 0, active: true },
            })
          ).statusCode,
          409,
        );
        const foreignTenant = await app.inject({
          url: "/api/v1/countries",
          headers: headersB,
        });
        assert.deepEqual(foreignTenant.json(), []);
        const upgrade = await createMigrator(db, root).getMigrations();
        assert.equal(upgrade.filter((value) => value.executedAt).length, 40);
        // Verify safe rollback of newly added configuration, then forward reapply.
        assert.equal((await migrate(db, root, "down")).length, 1);
        assert.equal((await migrate(db, root, "up")).length, 1);
      },
    );
    await t.test(
      "OpenAPI covers every module and has unique operation identifiers",
      async () => {
        const response = await app.inject({
          url: "/api/openapi.json",
          headers: reader,
        });
        assert.equal(response.statusCode, 200);
        const spec = response.json();
        const ids: string[] = [];
        for (const module of coreCases) {
          const route = spec.paths["/api/v1/" + module.collection];
          assert.ok(route?.get && route.post);
          assert.ok(
            spec.paths["/api/v1/" + module.collection + "/{publicId}"].patch,
          );
        }
        for (const path of Object.values(spec.paths) as any[])
          for (const method of ["get", "post", "patch", "delete"])
            if (path[method]) ids.push(path[method].operationId);
        assert.equal(new Set(ids).size, ids.length);
      },
    );
  });
});

test("upgrade preserves the first delivery records and refuses destructive additive rollback", async () => {
  await withTestDatabase(
    async ({ db, app, headersA }) => {
      const company = await app.inject({
        url: "/api/v1/companies/legacy01",
        headers: headersA,
      });
      assert.equal(company.statusCode, 200, company.body);
      assert.equal(company.json().name, "Legacy company");
      assert.equal(company.json().created_by, "legacy:actor");
      assert.deepEqual(company.json().bankAccounts, []);
      const contact = await app.inject({
        url: "/api/v1/contacts/legacy02",
        headers: headersA,
      });
      assert.equal(contact.statusCode, 200);
      assert.equal(contact.json().creditLimit, "0.0000");
      assert.equal(contact.json().created_by, "legacy:actor");
      const root = path.resolve("src/api/modules");
      for (let index = 0; index < 3; index++) await migrate(db, root, "down");
      await assert.rejects(migrate(db, root, "down"), /Migration failed/);
      assert.equal(
        (
          await db
            .selectFrom("contacts")
            .selectAll()
            .where("public_id", "=", "legacy02")
            .executeTakeFirstOrThrow()
        ).created_by,
        "legacy:actor",
      );
    },
    { existingBaseline: true },
  );
});
