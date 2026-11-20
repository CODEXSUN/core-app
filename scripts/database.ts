import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadServerEnvironment } from "@workspace/framework";
import { appDetails } from "../contracts/app.ts";
import { openDatabase } from "../src/api/database/connection.ts";
import { createMigrator, migrate } from "../src/api/database/migrate.ts";
import { seedModules } from "../src/api/database/seed.ts";

const root = fileURLToPath(new URL("../", import.meta.url));
const [command, ...options] = process.argv.slice(2);
try {
  if (!["status", "migrate", "rollback", "seed"].includes(command))
    throw new Error("Unknown database command.");
  let tenantId: string | undefined;
  let demo = false;
  for (let index = 0; index < options.length; index++) {
    if (command === "seed" && options[index] === "--demo") demo = true;
    else if (
      command === "seed" &&
      options[index] === "--tenant" &&
      options[index + 1]
    )
      tenantId = options[++index];
    else throw new Error("Use seed [--tenant <trusted-tenant-id>] [--demo].");
  }
  const config = loadServerEnvironment({
    root,
    prefix: appDetails.prefix,
    defaultPort: appDetails.port,
  });
  const db = openDatabase(config.values);
  const modules = path.join(root, "src/api/modules");
  try {
    if (command === "status")
      console.log(
        JSON.stringify(await (await createMigrator(db, modules)).getMigrations()),
      );
    else if (command === "seed")
      console.log(
        JSON.stringify(
          await seedModules(db, modules, {
            environment: config.environment,
            demo,
            tenantId,
          }),
        ),
      );
    else
      console.log(
        JSON.stringify(
          await migrate(db, modules, command === "migrate" ? "up" : "down"),
        ),
      );
  } finally {
    await db.destroy();
  }
} catch {
  console.error(
    "Database command failed. Check configuration, migration history and database availability; no credentials are logged.",
  );
  process.exitCode = 1;
}
