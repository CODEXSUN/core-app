import { loadServerEnvironment, requirePreflight } from "@workspace/framework";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { appDetails } from "../contracts/app.ts";

export const appRoot = fileURLToPath(new URL("../", import.meta.url));
export async function preflight() {
  const config = loadServerEnvironment({
    root: appRoot,
    prefix: appDetails.prefix,
    defaultPort: appDetails.port,
  });
  await requirePreflight({
    name: appDetails.name,
    root: appRoot,
    host: config.host,
    port: config.port,
    requiredPaths: [
      { path: "src/api/server.ts", kind: "file", label: "Server entry" },
      { path: "dist/web/index.html", kind: "file", label: "Frontend build" },
      {
        path: "node_modules/@workspace/ui/dist/src/index.js",
        kind: "file",
        label: "Shared UI build",
      },
    ],
  });
  return config;
}

if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  try {
    await preflight();
  } catch (error) {
    console.error(error instanceof Error ? error.message : "Preflight failed.");
    process.exitCode = 1;
  }
}
