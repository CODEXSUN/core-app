import test from "node:test";
import assert from "node:assert/strict";
import { createCoreClient } from "../contracts/client.ts";

test("Billing read client uses server credentials, validates IDs and reports failures", async () => {
  const token = "test-only-key-".repeat(4);
  const requests: { url: string; authorization: string | null }[] = [];
  const fetcher: typeof fetch = async (input, init) => {
    requests.push({
      url: String(input),
      authorization: new Headers(init?.headers).get("Authorization"),
    });
    return new Response(JSON.stringify([]), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  };
  const client = createCoreClient({
    baseUrl: "http://127.0.0.1:4406",
    token,
    fetcher,
  });
  await client.listCompanies();
  await client.listFinancialYears();
  await client.listContacts();
  assert.deepEqual(
    requests.map((value) => value.url),
    ["companies", "financial-years", "contacts"].map(
      (value) => "http://127.0.0.1:4406/api/v1/" + value,
    ),
  );
  assert.ok(
    requests.every((value) => value.authorization === "Bearer " + token),
  );
  await assert.rejects(client.getContact("../tenant-b"), /Invalid/);
  const denied = createCoreClient({
    baseUrl: "http://127.0.0.1:4406",
    token,
    fetcher: async () => new Response("", { status: 403 }),
  });
  await assert.rejects(denied.listContacts(), /403/);
  assert.throws(
    () => createCoreClient({ baseUrl: "http://127.0.0.1:4406/private", token }),
    /origin/,
  );
});
