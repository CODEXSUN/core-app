import {platformServiceOptions} from '@workspace/sdk/platform-service';
import { startHttpServer } from "@workspace/framework";
import { preflight } from "../../scripts/preflight.ts";
import { openDatabase } from "./database/connection.ts";
import { createApplication } from "./app.ts";
try {
  const config = await preflight();
 if(!platformServiceOptions(config.values,'CORE_APP','core-app'))throw Error('Configure Platform authentication before starting this app.');
  const db = openDatabase(config.values);
  const app = createApplication(db, config.values, config.host, config.port);
  app.addHook("onClose", async () => {
    await db.destroy();
  });
  await startHttpServer(app, config);
} catch {
  console.error(
    "Core App startup failed. Check its private configuration and preflight.",
  );
  process.exitCode = 1;
}
