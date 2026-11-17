import { ownerPermissions } from "../contracts/permissions.ts";
import { createHash, randomBytes } from "node:crypto";
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const args = process.argv.slice(2);
const tenantId = args[1],
  actorId = args[3];
if (
  args.length !== 4 ||
  args[0] !== "--tenant" ||
  args[2] !== "--actor" ||
  !tenantId ||
  !actorId ||
  [tenantId, actorId].some((value) => !/^[a-zA-Z0-9:._-]{1,128}$/.test(value))
) {
  throw new Error(
    "Use --tenant <trusted-tenant-id> --actor <service-identity>.",
  );
}
const envPath = path.join(root, ".env");
const output = path.join(root, ".env.billing-client");
if (existsSync(output))
  throw new Error(
    "Private Billing client file already exists; preserve or rotate it deliberately.",
  );
const source = readFileSync(envPath, "utf8");
const current = source.match(/^CORE_APP_API_CLIENTS=(.*)$/m)?.[1] ?? "[]";
const clients = JSON.parse(current);
if (
  !Array.isArray(clients) ||
  clients.some(
    (client) => client.actorId === actorId && client.tenantId === tenantId,
  )
) {
  throw new Error(
    "Client already exists or its configuration requires review.",
  );
}
const token = randomBytes(32).toString("hex");
clients.push({
  tokenHash: createHash("sha256").update(token).digest("hex"),
  actorId,
  tenantId,
  permissions: ownerPermissions.filter((permission) =>
    permission.endsWith(":read"),
  ),
});
const line = "CORE_APP_API_CLIENTS=" + JSON.stringify(clients);
const updated = /^CORE_APP_API_CLIENTS=.*$/m.test(source)
  ? source.replace(/^CORE_APP_API_CLIENTS=.*$/m, () => line)
  : source + "\n" + line + "\n";
// Never print credentials. Both files are ignored by Git.
writeFileSync(
  output,
  `CORE_API_URL=http://127.0.0.1:4345\nCORE_API_TOKEN=${token}\n`,
  { flag: "wx", mode: 0o600 },
);
writeFileSync(envPath, updated);
console.log(
  "Read-only Billing access configured. Restart Core; transfer the private client settings to Billing server configuration.",
);
