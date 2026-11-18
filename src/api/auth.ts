import { randomBytes, createHash, timingSafeEqual } from "node:crypto";
import type { FastifyInstance, FastifyRequest } from "fastify";
import type { ContextResolver, ModuleContext } from "./database/context.ts";

import { ownerPermissions } from "../../contracts/permissions.ts";
import {platformAuthentication} from './platform-auth.ts';
export { ownerPermissions };
type Client = ModuleContext & { tokenHash: string };
const cookieName = "core_app_session";
const maxAge = 8 * 60 * 60;
export function createAuthentication(
  values: NodeJS.ProcessEnv,
  host: string,
  port: number,
) {
  if(values.CORE_APP_PLATFORM_AUTH==='1')return platformAuthentication(values);
  const local = values.CORE_APP_LOCAL_ACCESS === "true";
  if (
    local &&
    (values.NODE_ENV === "production" || !["127.0.0.1", "::1"].includes(host))
  ) {
    throw new Error(
      "Local workspace access requires development mode and loopback binding.",
    );
  }
  const clients: Client[] = JSON.parse(values.CORE_APP_API_CLIENTS ?? "[]");
  if (
    !Array.isArray(clients) ||
    clients.some(
      (client) =>
        !client ||
        !/^[a-f0-9]{64}$/.test(client.tokenHash) ||
        !client.actorId?.trim() ||
        !client.tenantId?.trim() ||
        client.actorId.length > 128 ||
        client.tenantId.length > 128 ||
        !Array.isArray(client.permissions) ||
        client.permissions.some(
          (value) =>
            !ownerPermissions.includes(
              value as (typeof ownerPermissions)[number],
            ),
        ),
    )
  ) {
    throw new Error("Invalid Core API client configuration.");
  }
  const sessions = new Map<
    string,
    { context: ModuleContext; expires: number }
  >();
  const origin =
    values.CORE_APP_PUBLIC_ORIGIN ??
    `http://${host === "::1" ? "[::1]" : host}:${port}`;
  if (new URL(origin).origin !== origin)
    throw new Error("Configure an exact public origin.");
  if (values.NODE_ENV === "production" && !origin.startsWith("https://"))
    throw new Error("Production browser sessions require HTTPS.");
  const contextForClient = (client: Client): ModuleContext => ({
    actorId: client.actorId,
    tenantId: client.tenantId,
    permissions: [...client.permissions],
  });
  function bearer(request: FastifyRequest) {
    const value = request.headers.authorization;
    if (!value?.startsWith("Bearer ") || value.length > 4096) return null;
    const digest = createHash("sha256").update(value.slice(7)).digest();
    const client = clients.find((candidate) =>
      timingSafeEqual(digest, Buffer.from(candidate.tokenHash, "hex")),
    );
    return client ? contextForClient(client) : null;
  }
  function sameOrigin(request: FastifyRequest) {
    return request.headers.origin === origin;
  }
  const resolveContext: ContextResolver = async (request) => {
    if (request.headers.authorization) return bearer(request);
    const token = request.headers.cookie
      ?.split(";")
      .map((value) => value.trim())
      .find((value) => value.startsWith(cookieName + "="))
      ?.slice(cookieName.length + 1);
    const session = token ? sessions.get(token) : undefined;
    if (!session || session.expires <= Date.now()) {
      if (token) sessions.delete(token);
      return null;
    }
    if (
      !["GET", "HEAD", "OPTIONS"].includes(request.method) &&
      !sameOrigin(request)
    )
      return null;
    return session.context;
  };
  function register(app: FastifyInstance) {
    app.get("/api/v1/session", async (request, reply) => {
      const context = await resolveContext(request);
      reply.header("Cache-Control", "no-store");
      return { context, localAccess: local };
    });
    app.post<{ Body: { token?: string; local?: boolean } }>(
      "/api/v1/session",
      {
        schema: {
          body: {
            type: "object",
            additionalProperties: false,
            properties: {
              token: { type: "string", minLength: 32, maxLength: 4096 },
              local: { type: "boolean" },
            },
          },
        },
      },
      async (request, reply) => {
        if (!sameOrigin(request))
          return reply
            .code(403)
            .send({
              message: "Open this workspace at its configured address.",
            });
        const remoteAddress = request.ip;
        const context =
          local &&
          request.body.local === true &&
          ["127.0.0.1", "::1", "::ffff:127.0.0.1"].includes(remoteAddress)
            ? {
                actorId: "local:developer",
                tenantId: "local-development",
                permissions: [...ownerPermissions],
              }
            : request.body.token
              ? bearer({
                  headers: { authorization: `Bearer ${request.body.token}` },
                } as FastifyRequest)
              : null;
        if (!context)
          return reply
            .code(401)
            .send({ message: "Workspace access was not accepted." });
        for (const [key, session] of sessions)
          if (session.expires <= Date.now()) sessions.delete(key);
        if (sessions.size >= 1000)
          return reply
            .code(503)
            .send({ message: "Too many workspace sessions. Try again later." });
        const token = randomBytes(32).toString("hex");
        sessions.set(token, { context, expires: Date.now() + maxAge * 1000 });
        reply.header(
          "Set-Cookie",
          `${cookieName}=${token}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${maxAge}${origin.startsWith("https:") ? "; Secure" : ""}`,
        );
        reply.header("Cache-Control", "no-store");
        return { context };
      },
    );
    app.delete("/api/v1/session", async (request, reply) => {
      if (!sameOrigin(request))
        return reply.code(403).send({ message: "Permission denied." });
      const token = request.headers.cookie
        ?.split(";")
        .map((value) => value.trim())
        .find((value) => value.startsWith(cookieName + "="))
        ?.slice(cookieName.length + 1);
      if (token) sessions.delete(token);
      reply.header(
        "Set-Cookie",
        `${cookieName}=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0`,
      );
      return reply.code(204).send();
    });
  }
  return { resolveContext, register };
}

export const sessionOpenApiPaths = {
  "/api/v1/session": {
    get: {
      operationId: "getWorkspaceSession",
      tags: ["Session"],
      responses: {
        "200": {
          description: "Current browser session and local access availability",
        },
      },
    },
    post: {
      operationId: "connectWorkspaceSession",
      tags: ["Session"],
      description:
        "Requires the exact configured Origin. Local access is restricted to explicitly enabled loopback development servers.",
      parameters: [
        {
          name: "Origin",
          in: "header",
          required: true,
          schema: {
            type: "string",
            format: "uri",
          },
        },
      ],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              additionalProperties: false,
              properties: {
                token: {
                  type: "string",
                  minLength: 32,
                  maxLength: 4096,
                },
                local: {
                  type: "boolean",
                },
              },
            },
          },
        },
      },
      responses: {
        "200": {
          description: "HttpOnly SameSite browser session established",
        },
        "401": {
          description: "Access not accepted",
        },
        "403": {
          description: "Origin rejected",
        },
        "503": {
          description: "Session limit reached",
        },
      },
    },
    delete: {
      operationId: "disconnectWorkspaceSession",
      tags: ["Session"],
      parameters: [
        {
          name: "Origin",
          in: "header",
          required: true,
          schema: {
            type: "string",
            format: "uri",
          },
        },
      ],
      responses: {
        "204": {
          description: "Browser session revoked",
        },
        "403": {
          description: "Origin rejected",
        },
      },
    },
  },
} as const;
