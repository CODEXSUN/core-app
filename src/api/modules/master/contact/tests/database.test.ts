import { addressesSchema } from "../../../../../../contracts/party.ts";
import test from "node:test";
import assert from "node:assert/strict";
import {
  withTestDatabase,
  contactValues,
} from "../../../../../../tests/database-harness.ts";
import { insertContact } from "../repository.ts";
test("Contact: migration, scoped persistence, permissions and domain constraints", async () => {
  await withTestDatabase(async ({ db, app, headersA, headersB, reader }) => {
    const values = contactValues;
    const url = "/api/v1/contacts";
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
    assert.ok(!("id" in saved) && !("tenant_id" in saved));
    assert.equal(saved.created_by, "test:verified-actor");
    const stored = await db
      .selectFrom("contacts")
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

    const withAddress = {
      ...values,
      code: "ADDRESSED",
      addresses: [
        {
          label: "billing",
          addressLine1: "Test street",
          addressLine2: "",
          city: "Test city",
          state: "",
          postalCode: "",
          country: "India",
          isDefault: true,
        },
      ],
    };
    const addressed = await app.inject({
      method: "POST",
      url,
      headers: headersA,
      payload: withAddress,
    });
    assert.equal(addressed.statusCode, 201);
    assert.deepEqual(
      addressed.json().addresses,
      addressesSchema.parse(withAddress.addresses),
    );
    assert.equal(
      (
        await app.inject({
          method: "POST",
          url,
          headers: headersA,
          payload: {
            ...values,
            code: "BAD-EMAIL",
            emails: [{ email: "invalid", label: "Work", isPrimary: true }],
          },
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
          payload: {
            ...values,
            code: "BAD-PRIM",
            emails: [
              { email: "a@example.test", label: "Work", isPrimary: true },
              { email: "b@example.test", label: "Work", isPrimary: true },
            ],
          },
        })
      ).statusCode,
      400,
    );
    const duplicate = await app.inject({
      method: "POST",
      url,
      headers: headersA,
      payload: values,
    });
    assert.equal(duplicate.statusCode, 409);
    let attempts = 0;
    const recovered = await insertContact(
      db,
      { actorId: "test:verified-actor", tenantId: "tenant-a", permissions: [] },
      { ...values, code: "RETRY" },
      () => (++attempts === 1 ? saved.public_id : "retry001"),
    );
    assert.equal(recovered.public_id, "retry001");
    assert.equal(attempts, 2);
    attempts = 0;
    await assert.rejects(
      insertContact(
        db,
        {
          actorId: "test:verified-actor",
          tenantId: "tenant-a",
          permissions: [],
        },
        { ...values, code: "COLLIDE" },
        () => {
          attempts++;
          return saved.public_id;
        },
      ),
      /allocate/,
    );
    assert.equal(attempts, 5);

    const readerSpec = await app.inject({
      url: "/api/openapi.json",
      headers: reader,
    });
    assert.equal(readerSpec.statusCode, 200);
    assert.ok(readerSpec.json().paths[url].post.requestBody);
  });
});
