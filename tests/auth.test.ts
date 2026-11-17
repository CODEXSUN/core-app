import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { createHttpServer } from "@workspace/framework";
import { createAuthentication } from "../src/api/auth.ts";

test("local sessions require explicit loopback development access and same-origin writes", async () => {
  assert.throws(
    () =>
      createAuthentication(
        { NODE_ENV: "production", CORE_APP_LOCAL_ACCESS: "true" },
        "127.0.0.1",
        4406,
      ),
    /development/,
  );
  assert.throws(
    () =>
      createAuthentication(
        { NODE_ENV: "development", CORE_APP_LOCAL_ACCESS: "true" },
        "0.0.0.0",
        4406,
      ),
    /loopback/,
  );
  const app = createHttpServer({ name: "core-auth-test", logLevel: "silent" });
  const auth = createAuthentication(
    { NODE_ENV: "test", CORE_APP_LOCAL_ACCESS: "true" },
    "127.0.0.1",
    4406,
  );
  auth.register(app);
  app.get(
    "/private",
    async (request, reply) =>
      (await auth.resolveContext(request)) ?? reply.code(401).send(),
  );
  app.post(
    "/private",
    async (request, reply) =>
      (await auth.resolveContext(request)) ?? reply.code(401).send(),
  );
  try {
    assert.equal((await app.inject("/private")).statusCode, 401);
    assert.equal(
      (
        await app.inject({
          method: "POST",
          url: "/api/v1/session",
          payload: { local: true },
        })
      ).statusCode,
      403,
    );
    assert.equal(
      (
        await app.inject({
          method: "POST",
          url: "/api/v1/session",
          headers: { origin: "https://untrusted.example" },
          payload: { local: true },
        })
      ).statusCode,
      403,
    );
    const connected = await app.inject({
      method: "POST",
      url: "/api/v1/session",
      remoteAddress: "127.0.0.1",
      headers: { origin: "http://127.0.0.1:4406" },
      payload: { local: true },
    });
    assert.equal(connected.statusCode, 200);
    const cookie = String(connected.headers["set-cookie"]).split(";")[0];
    assert.match(
      String(connected.headers["set-cookie"]),
      /HttpOnly; SameSite=Strict/,
    );
    assert.equal(
      (await app.inject({ url: "/private", headers: { cookie } })).json()
        .tenantId,
      "local-development",
    );
    assert.equal(
      (
        await app.inject({
          method: "POST",
          url: "/private",
          headers: { cookie },
        })
      ).statusCode,
      401,
    );
    assert.equal(
      (
        await app.inject({
          method: "POST",
          url: "/private",
          headers: { cookie, origin: "http://127.0.0.1:4406" },
        })
      ).statusCode,
      200,
    );
    await app.inject({
      method: "DELETE",
      url: "/api/v1/session",
      headers: { cookie, origin: "http://127.0.0.1:4406" },
    });
    assert.equal(
      (await app.inject({ url: "/private", headers: { cookie } })).statusCode,
      401,
    );
  } finally {
    await app.close();
  }
});

test("service credentials bind actor, tenant and permissions on the server", async () => {
  const token = "test-only-token-".repeat(4);
  const auth = createAuthentication(
    {
      NODE_ENV: "test",
      CORE_APP_API_CLIENTS: JSON.stringify([
        {
          tokenHash: createHash("sha256").update(token).digest("hex"),
          actorId: "service:billing",
          tenantId: "verified-tenant",
          permissions: ["master/contact:read"],
        },
      ]),
    },
    "127.0.0.1",
    4406,
  );
  const app = createHttpServer({
    name: "core-service-test",
    logLevel: "silent",
  });
  auth.register(app);
  app.get(
    "/private",
    async (request, reply) =>
      (await auth.resolveContext(request)) ?? reply.code(401).send(),
  );
  try {
    assert.equal(
      (
        await app.inject({
          url: "/private",
          headers: { authorization: "Bearer invalid" },
        })
      ).statusCode,
      401,
    );
    const result = await app.inject({
      url: "/private",
      headers: {
        authorization: "Bearer " + token,
        "x-tenant-id": "forged",
        "x-permissions": "*",
      },
    });
    assert.equal(result.json().tenantId, "verified-tenant");
    assert.deepEqual(result.json().permissions, ["master/contact:read"]);
    assert.equal(
      (
        await app.inject({
          method: "POST",
          url: "/api/v1/session",
          headers: { origin: "http://127.0.0.1:4406" },
          payload: { local: true },
        })
      ).statusCode,
      401,
    );
  } finally {
    await app.close();
  }
});
