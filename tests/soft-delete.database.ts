import test from "node:test";
import assert from "node:assert/strict";
import { sql } from "kysely";
import { withTestDatabase } from "./database-harness.ts";
import { coreCases } from "./core-module-cases.ts";

test("all Core modules: guarded deletion, reference protection, hidden records and no resurrection", async (t) => {
  await withTestDatabase(async ({ db, app, headersA, headersB, reader }) => {
    const records = new Map<
      string,
      { public_id: string; updated_at: string }
    >();
    const inputs = new Map<string, Record<string, unknown>>();
    for (const module of coreCases) {
      const values: Record<string, unknown> = { ...module.values };
      for (const ref of module.refs)
        values[ref.field] = records.get(ref.target)!.public_id;
      inputs.set(module.name, values);
      const result = await app.inject({
        method: "POST",
        url: "/api/v1/" + module.collection,
        headers: headersA,
        payload: values,
      });
      assert.equal(result.statusCode, 201, result.body);
      const saved = result.json();
      records.set(module.name, saved);
      const url = "/api/v1/" + module.collection + "/" + saved.public_id;
      assert.equal(
        (await app.inject({ method: "DELETE", url })).statusCode,
        401,
      );
      assert.equal(
        (await app.inject({ method: "DELETE", url, headers: reader }))
          .statusCode,
        403,
      );
      assert.equal(
        (await app.inject({ method: "DELETE", url, headers: headersB }))
          .statusCode,
        404,
      );
      assert.equal(
        (await app.inject({ url, headers: headersA })).statusCode,
        200,
      );
    }
    for (const module of coreCases) {
      for (const ref of module.refs) {
        const parent = coreCases.find((row) => row.name === ref.target)!;
        const result = await app.inject({
          method: "DELETE",
          url:
            "/api/v1/" +
            parent.collection +
            "/" +
            records.get(parent.name)!.public_id,
          headers: headersA,
        });
        assert.equal(
          result.statusCode,
          409,
          parent.name +
            " must retain live " +
            module.name +
            " reference: " +
            result.body,
        );
      }
    }
    for (const module of [...coreCases].reverse()) {
      await t.test(module.name, async () => {
        const saved = records.get(module.name)!,
          url = "/api/v1/" + module.collection + "/" + saved.public_id;
        const result = await app.inject({
          method: "DELETE",
          url,
          headers: headersA,
        });
        assert.equal(result.statusCode, 200, result.body);
        assert.equal(result.json().public_id, saved.public_id);
        assert.equal(result.json().active, false);
        assert.equal(result.json().deleted_by, "test:verified-actor");
        assert.equal(
          (await app.inject({ url, headers: headersA })).statusCode,
          404,
        );
        assert.equal(
          (await app.inject({ method: "DELETE", url, headers: headersA }))
            .statusCode,
          404,
        );
        assert.equal(
          (
            await app.inject({
              method: "PATCH",
              url,
              headers: headersA,
              payload: inputs.get(module.name),
            })
          ).statusCode,
          404,
          "deleted IDs cannot be updated back to life",
        );
        const list = await app.inject({
          url: "/api/v1/" + module.collection,
          headers: headersA,
        });
        assert.equal(list.statusCode, 200, list.body);
        assert.ok(
          !list
            .json()
            .some(
              (row: { public_id: string }) => row.public_id === saved.public_id,
            ),
        );
        const page = await app.inject({
          url:
            "/api/v1/" +
            module.collection +
            "/page?q=" +
            encodeURIComponent(String(inputs.get(module.name)!.name)),
          headers: headersA,
        });
        assert.equal(page.statusCode, 200, page.body);
        assert.ok(
          !page
            .json()
            .rows.some(
              (row: { public_id: string }) => row.public_id === saved.public_id,
            ),
        );
        const persisted = await sql<{
          active: boolean;
          deleted_at: Date;
          deleted_by: string;
        }>`SELECT active,deleted_at,deleted_by FROM ${sql.table(module.table)} WHERE public_id=${saved.public_id}`.execute(
          db,
        );
        assert.equal(
          persisted.rows.length,
          1,
          "soft deletion preserves the row and public-ID uniqueness",
        );
        assert.equal(persisted.rows[0].deleted_by, "test:verified-actor");
        assert.ok(persisted.rows[0].deleted_at);
      });
    }
    await t.test(
      "JSON company/contact references protect address and bank masters",
      async () => {
        const created = new Map<string, string>();
        for (const name of ["country", "address-type", "bank-name"]) {
          const module = coreCases.find((row) => row.name === name)!;
          const response = await app.inject({
            method: "POST",
            url: "/api/v1/" + module.collection,
            headers: headersA,
            payload: {
              ...module.values,
              name: name === "country" ? "JSON country" : "JSON " + name,
              ...(name === "country" ? { code: "XJ" } : {}),
            },
          });
          assert.equal(response.statusCode, 201, response.body);
          created.set(name, response.json().public_id);
        }
        for (const owner of ["company", "contact"]) {
          const module = coreCases.find((row) => row.name === owner)!;
          const response = await app.inject({
            method: "POST",
            url: "/api/v1/" + module.collection,
            headers: headersA,
            payload: {
              ...module.values,
              name: "JSON " + owner,
              code: "JSON-" + owner,
              addresses: [
                {
                  addressLine1: "JSON road",
                  country: "JSON country",
                  countryId: created.get("country"),
                  addressTypeId: created.get("address-type"),
                },
              ],
              bankAccounts: [
                {
                  bankNameId: created.get("bank-name"),
                  bankName: "JSON bank",
                  accountType: "Current",
                  accountNumber: "123456789",
                  holderName: "JSON holder",
                  ifsc: "TEST0000001",
                  branch: "QA",
                  isPrimary: true,
                },
              ],
            },
          });
          assert.equal(response.statusCode, 201, response.body);
          created.set(owner, response.json().public_id);
        }
        for (const name of ["country", "address-type", "bank-name"]) {
          const module = coreCases.find((row) => row.name === name)!;
          assert.equal(
            (
              await app.inject({
                method: "DELETE",
                url: "/api/v1/" + module.collection + "/" + created.get(name),
                headers: headersA,
              })
            ).statusCode,
            409,
          );
        }
        for (const name of [
          "company",
          "contact",
          "country",
          "address-type",
          "bank-name",
        ]) {
          const module = coreCases.find((row) => row.name === name)!;
          const removed = await app.inject({
            method: "DELETE",
            url: "/api/v1/" + module.collection + "/" + created.get(name),
            headers: headersA,
          });
          assert.equal(removed.statusCode, 200, removed.body);
        }
      },
    );
    await t.test(
      "deleting the current financial year clears its current flag atomically",
      async () => {
        const created = await app.inject({
          method: "POST",
          url: "/api/v1/financial-years",
          headers: headersA,
          payload: {
            name: "2035-36",
            startDate: "2035-04-01",
            endDate: "2036-03-31",
            isCurrent: true,
            active: true,
          },
        });
        assert.equal(created.statusCode, 201, created.body);
        const id = created.json().public_id;
        const removed = await app.inject({
          method: "DELETE",
          url: "/api/v1/financial-years/" + id,
          headers: headersA,
        });
        assert.equal(removed.statusCode, 200, removed.body);
        const row = await db
          .selectFrom("financial_years")
          .select(["is_current", "active", "deleted_at"])
          .where("public_id", "=", id)
          .executeTakeFirstOrThrow();
        assert.equal(row.is_current, false);
        assert.equal(row.active, false);
        assert.ok(row.deleted_at);
      },
    );
    await t.test(
      "parent deletion races safely with creation of a referencing child",
      async () => {
        const created = await app.inject({
          method: "POST",
          url: "/api/v1/countries",
          headers: headersA,
          payload: {
            name: "Race country",
            code: "XR",
            active: true,
            sortOrder: 0,
          },
        });
        assert.equal(created.statusCode, 201, created.body);
        const id = created.json().public_id;
        const results = await Promise.all([
          app.inject({
            method: "DELETE",
            url: "/api/v1/countries/" + id,
            headers: headersA,
          }),
          app.inject({
            method: "POST",
            url: "/api/v1/states",
            headers: headersA,
            payload: {
              name: "Race state",
              code: "RACE",
              countryId: id,
              active: true,
              sortOrder: 0,
            },
          }),
        ]);
        assert.equal(
          results.filter((row) => [200, 201].includes(row.statusCode)).length,
          1,
          "delete and dependent create cannot both succeed",
        );
        assert.equal(results.filter((row) => row.statusCode === 409).length, 1);
      },
    );
    for (const module of coreCases) {
      if (!module.refs.length) continue;
      const result = await app.inject({
        method: "POST",
        url: "/api/v1/" + module.collection,
        headers: headersA,
        payload: { ...inputs.get(module.name), name: "New " + module.name },
      });
      assert.equal(
        result.statusCode,
        409,
        "new " +
          module.name +
          " cannot reference a deleted master: " +
          result.body,
      );
    }
  });
});
