import {registerPlatformServiceInfo} from '@workspace/sdk/platform-application';
import { createHttpServer, registerFrontend } from "@workspace/framework";
import path from "node:path";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import type { Kysely } from "kysely";
import type { Database } from "./database/schema.ts";
import { createAuthentication, sessionOpenApiPaths } from "./auth.ts";
import {
  registerCoreModules,
  coreOpenApiPaths,
  coreSchemaReady,
} from "./modules/register.ts";

export function createApplication(
  db: Kysely<Database>,
  values: NodeJS.ProcessEnv,
  host = "127.0.0.1",
  port = 4345,
) {
  const root = fileURLToPath(new URL("../../", import.meta.url));
  const auth = createAuthentication(values, host, port);
  const app = createHttpServer({
    name: "core-app",
    logLevel: "silent",
    readinessChecks: [() => coreSchemaReady(db)],
  });
  auth.register(app);
  app.addHook("onSend", async (request, reply, payload) => {
    if (request.url.startsWith("/api/"))
      reply.header("Cache-Control", "no-store");
    return payload;
  });
  registerCoreModules(app, db, auth.resolveContext);
  const manifest = JSON.parse(
    readFileSync(path.join(root, "package.json"), "utf8"),
  );
  if(values.CORE_APP_PLATFORM_AUTH==='1')registerPlatformServiceInfo(app,{appKey:'core-app',version:manifest.version,databaseScope:'existing-tenant',tenantId:values.CORE_APP_PLATFORM_TENANT_ID});
  app.get("/api/openapi.json", async (request, reply) => {
    const context = await auth.resolveContext(request);
    if (!context)
      return reply
        .code(401)
        .send({ message: "Connect to your workspace to continue." });
    return {
      openapi: "3.1.0",
      info: { title: "Core App API", version: manifest.version },
      components: {
        securitySchemes: {
          bearerAuth: { type: "http", scheme: "bearer" },
          cookieAuth: {
            type: "apiKey",
            in: "cookie",
            name: "core_app_session",
          },
        },
      },
      paths: { ...sessionOpenApiPaths, ...coreOpenApiPaths },
    };
  });
  app.get("/api/docs", async (request, reply) => {
    if (!(await auth.resolveContext(request)))
      return reply
        .code(401)
        .send({ message: "Connect to your workspace to continue." });
    return reply.redirect("/api/openapi.json");
  });
  registerFrontend(app, path.join(root, "dist/web"));
  return app;
}
