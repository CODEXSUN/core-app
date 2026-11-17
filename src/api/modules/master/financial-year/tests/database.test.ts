import test from "node:test";
import assert from "node:assert/strict";
import {
  withTestDatabase,
  financialYearValues,
} from "../../../../../../tests/database-harness.ts";

test("FinancialYear: migration, scoped persistence, permissions and domain constraints", async () => {
  await withTestDatabase(async ({ db, app, headersA, headersB, reader }) => {
    const values = financialYearValues;
    const url = "/api/v1/financial-years";
    assert.equal((await app.inject(url)).statusCode, 401);
    assert.equal(
      (
        await app.inject({
          url,
          headers: {
            "x-tenant-id": "tenant-a",
            "x-actor-id": "owner",
            "x-permissions": "*",
          },
        })
      ).statusCode,
      401,
    );
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
          payload: { ...values, tenant_id: "forged" },
        })
      ).statusCode,
      400,
    );
    const created = await app.inject({
      method: "POST",
      url,
      headers: headersA,
      payload: values,
    });
    assert.equal(created.statusCode, 201, created.body);
    const saved = created.json();
    assert.match(saved.public_id, /^[a-z0-9]{8}$/);
    assert.equal(saved.startDate, values.startDate);
    assert.equal(saved.endDate, values.endDate);
    assert.ok(!("id" in saved) && !("tenant_id" in saved));
    assert.equal(saved.created_by, "test:verified-actor");
    const stored = await db
      .selectFrom("financial_years")
      .selectAll()
      .executeTakeFirstOrThrow();
    assert.equal(stored.tenant_id, "tenant-a");
    assert.equal(stored.created_by, "test:verified-actor");
    assert.ok(Number.isInteger(stored.id));
    assert.deepEqual((await app.inject({ url, headers: headersB })).json(), []);
    assert.equal(
      (
        await app.inject({
          url: url + "/" + saved.public_id,
          headers: headersB,
        })
      ).statusCode,
      404,
    );
    assert.equal(
      (
        await app.inject({
          method: "PATCH",
          url: url + "/" + saved.public_id,
          headers: headersB,
          payload: values,
        })
      ).statusCode,
      404,
    );
    const tenantB = await app.inject({
      method: "POST",
      url,
      headers: headersB,
      payload: values,
    });
    assert.equal(tenantB.statusCode, 201);
    const edited = await app.inject({
      method: "PATCH",
      url: url + "/" + saved.public_id,
      headers: headersA,
      payload: { ...values, name: "Edited" },
    });
    assert.equal(edited.statusCode, 200);
    assert.equal(edited.json().name, "Edited");
    assert.equal(edited.json().created_at, saved.created_at);
    assert.equal(
      (await app.inject({ url: url + "/1", headers: headersA })).statusCode,
      400,
    );
    assert.equal(
      (await app.inject({ url: url + "/zzzzzzzz", headers: headersA }))
        .statusCode,
      404,
    );
    assert.equal(
      (
        await app.inject({
          method: "DELETE",
          url: url + "/" + saved.public_id,
          headers: headersA,
        })
      ).statusCode,
      404,
    );

    const next = {
      ...values,
      name: "2027-28",
      startDate: "2027-04-01",
      endDate: "2028-03-31",
    };
    const later = {
      ...values,
      name: "2028-29",
      startDate: "2028-04-01",
      endDate: "2029-03-31",
    };
    const concurrent = await Promise.all(
      [next, later].map((payload) =>
        app.inject({ method: "POST", url, headers: headersA, payload }),
      ),
    );
    assert.ok(concurrent.every((response) => response.statusCode === 201));
    assert.equal(
      (
        await db
          .selectFrom("financial_years")
          .selectAll()
          .where("tenant_id", "=", "tenant-a")
          .where("is_current", "=", true)
          .execute()
      ).length,
      1,
    );
    const current = (await app.inject({ url, headers: headersA }))
      .json()
      .find((record: { isCurrent: boolean }) => record.isCurrent);
    const forbidden = await app.inject({
      method: "PATCH",
      url: url + "/" + current.public_id,
      headers: headersA,
      payload: {
        ...later,
        name: current.name,
        startDate: current.startDate,
        endDate: current.endDate,
        active: false,
      },
    });
    assert.equal(forbidden.statusCode, 400);
    assert.equal(
      (
        await app.inject({
          method: "POST",
          url,
          headers: headersA,
          payload: { ...values, startDate: "2026-02-30" },
        })
      ).statusCode,
      400,
    );
    assert.equal(
      (
        await app.inject({
          method: "POST",
          url,
          headers: headersA,
          payload: { ...values, endDate: "2025-03-31" },
        })
      ).statusCode,
      400,
    );
    assert.equal(
      (
        await app.inject({
          method: "PATCH",
          url: url + "/zzzzzzzz",
          headers: headersA,
          payload: next,
        })
      ).statusCode,
      404,
    );
    assert.equal(
      (
        await db
          .selectFrom("financial_years")
          .selectAll()
          .where("tenant_id", "=", "tenant-a")
          .where("is_current", "=", true)
          .execute()
      ).length,
      1,
    );

    const readerSpec = await app.inject({
      url: "/api/openapi.json",
      headers: reader,
    });
    assert.equal(readerSpec.statusCode, 200);
    assert.ok(readerSpec.json().paths[url].post.requestBody);
  });
});
