import {modulePageOpenApi} from '../../../../../contracts/module-page.ts';
import { z } from "zod";
import type { FastifyInstance } from "fastify";
import type { ContextResolver } from "../../../database/context.ts";
import { performModule } from "../../../http.ts";
import type { createLedgerService } from "./service.ts";
import { ledgerValuesSchema } from "../../../../../contracts/ledger.ts";

export function registerLedgerRoutes(
  app: FastifyInstance,
  service: ReturnType<typeof createLedgerService>,
  resolveContext: ContextResolver,
) {
  app.get('/api/v1/ledgers/page',(request,reply)=>performModule(request,reply,resolveContext,context=>service.page(context,request.query)));
  app.get("/api/v1/ledgers", (request, reply) =>
    performModule(request, reply, resolveContext, (context) =>
      service.list(context),
    ),
  );
  app.get<{ Params: { publicId: string } }>(
    "/api/v1/ledgers/:publicId",
    (request, reply) =>
      performModule(request, reply, resolveContext, (context) =>
        service.find(context, request.params.publicId),
      ),
  );
  app.post<{ Body: unknown }>("/api/v1/ledgers", (request, reply) =>
    performModule(
      request,
      reply,
      resolveContext,
      (context) => service.create(context, request.body),
      201,
    ),
  );
  app.patch<{ Params: { publicId: string }; Body: unknown }>(
    "/api/v1/ledgers/:publicId",
    (request, reply) =>
      performModule(request, reply, resolveContext, (context) =>
        service.update(context, request.params.publicId, request.body),
      ),
  );
}
const inputSchema = z.toJSONSchema(ledgerValuesSchema, { io: "input" });
export const recordSchema = {
  ...inputSchema,
  properties: {
    ...inputSchema.properties,
    public_id: { type: "string", pattern: "^[a-z0-9]{8}$" },
    ledgerGroupName: { type: "string" },
    created_at: { type: "string", format: "date-time" },
    updated_at: { type: "string", format: "date-time" },
    created_by: { type: "string" },
    updated_by: { type: "string" },
  },
  required: [
    ...(inputSchema.required ?? []),
    "public_id",
    "created_at",
    "updated_at",
    "created_by",
    "updated_by",
  ],
};
const errors = Object.fromEntries(
  [400, 401, 403, 404, 409, 503].map((status) => [
    String(status),
    {
      description: {
        400: "Invalid input",
        401: "Authentication required",
        403: "Permission denied",
        404: "Record not found",
        409: "Duplicate or conflicting record",
        503: "Storage unavailable",
      }[status as 400],
    },
  ]),
);
function operation(
  action: string,
  write: boolean,
  schema: unknown,
  status = "200",
) {
  return {
    operationId: "ledger" + action,
    tags: ["Ledger"],
    description:
      "Permission: common/ledger:" +
      (write ? "write" : "read") +
      ". Trusted tenant scope is derived from authentication.",
    security: [{ bearerAuth: [] }, { cookieAuth: [] }],
    responses: {
      ...errors,
      [status]: {
        description: "Authorized result",
        content: { "application/json": { schema } },
      },
    },
  };
}
const requestBody = {
  required: true,
  content: { "application/json": { schema: inputSchema } },
};
export const ledgerOpenApiPaths = {
  '/api/v1/ledgers/page':{get:modulePageOpenApi('ledgerPage',["name","ledgerGroupId","sortOrder","active"])},
  "/api/v1/ledgers": {
    get: operation("List", false, { type: "array", items: recordSchema }),
    post: { ...operation("Create", true, recordSchema, "201"), requestBody },
  },
  "/api/v1/ledgers/{publicId}": {
    parameters: [
      {
        name: "publicId",
        in: "path",
        required: true,
        schema: { type: "string", pattern: "^[a-z0-9]{8}$" },
      },
    ],
    get: operation("Read", false, recordSchema),
    patch: { ...operation("Update", true, recordSchema), requestBody },
  },
};
