import {modulePageOpenApi} from '../../../../../contracts/module-page.ts';
import { z } from "zod";
import type { FastifyInstance } from "fastify";
import type { ContextResolver } from "../../../database/context.ts";
import { performModule } from "../../../http.ts";
import type { createStateService } from "./service.ts";
import { stateValuesSchema } from "../../../../../contracts/state.ts";

export function registerStateRoutes(
  app: FastifyInstance,
  service: ReturnType<typeof createStateService>,
  resolveContext: ContextResolver,
) {
  app.get('/api/v1/states/page',(request,reply)=>performModule(request,reply,resolveContext,context=>service.page(context,request.query)));
  app.get("/api/v1/states", (request, reply) =>
    performModule(request, reply, resolveContext, (context) =>
      service.list(context),
    ),
  );
  app.get<{ Params: { publicId: string } }>(
    "/api/v1/states/:publicId",
    (request, reply) =>
      performModule(request, reply, resolveContext, (context) =>
        service.find(context, request.params.publicId),
      ),
  );
  app.post<{ Body: unknown }>("/api/v1/states", (request, reply) =>
    performModule(
      request,
      reply,
      resolveContext,
      (context) => service.create(context, request.body),
      201,
    ),
  );
  app.patch<{ Params: { publicId: string }; Body: unknown }>(
    "/api/v1/states/:publicId",
    (request, reply) =>
      performModule(request, reply, resolveContext, (context) =>
        service.update(context, request.params.publicId, request.body),
      ),
  );
}
const inputSchema = z.toJSONSchema(stateValuesSchema, { io: "input" });
export const recordSchema = {
  ...inputSchema,
  properties: {
    ...inputSchema.properties,
    public_id: { type: "string", pattern: "^[a-z0-9]{8}$" },
    countryName: { type: "string" },
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
    operationId: "state" + action,
    tags: ["State"],
    description:
      "Permission: common/state:" +
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
export const stateOpenApiPaths = {
  '/api/v1/states/page':{get:modulePageOpenApi('statePage',["name","countryId","code","sortOrder","active"])},
  "/api/v1/states": {
    get: operation("List", false, { type: "array", items: recordSchema }),
    post: { ...operation("Create", true, recordSchema, "201"), requestBody },
  },
  "/api/v1/states/{publicId}": {
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
