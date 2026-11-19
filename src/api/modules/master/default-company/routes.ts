import {modulePageOpenApi} from '../../../../../contracts/module-page.ts';
import type { Kysely } from "kysely";
import type { Database } from "../../../database/schema.ts";
import { getOrganisationContext, getCurrentDefaultCompany } from "./index.ts";
import { recordSchema as companySchema } from "../company/routes.ts";
import { recordSchema as yearSchema } from "../financial-year/routes.ts";
import { z } from "zod";
import type { FastifyInstance } from "fastify";
import type { ContextResolver } from "../../../database/context.ts";
import { performModule } from "../../../http.ts";
import type { createDefaultCompanyService } from "./service.ts";
import { defaultCompanyValuesSchema } from "../../../../../contracts/default-company.ts";

export function registerDefaultCompanyRoutes(
  app: FastifyInstance,
  service: ReturnType<typeof createDefaultCompanyService>,
  resolveContext: ContextResolver,
) {
  app.get('/api/v1/default-companies/page',(request,reply)=>performModule(request,reply,resolveContext,context=>service.page(context,request.query)));
  app.get("/api/v1/default-companies", (request, reply) =>
    performModule(request, reply, resolveContext, (context) =>
      service.list(context),
    ),
  );
  app.get<{ Params: { publicId: string } }>(
    "/api/v1/default-companies/:publicId",
    (request, reply) =>
      performModule(request, reply, resolveContext, (context) =>
        service.find(context, request.params.publicId),
      ),
  );
  app.post<{ Body: unknown }>("/api/v1/default-companies", (request, reply) =>
    performModule(
      request,
      reply,
      resolveContext,
      (context) => service.create(context, request.body),
      201,
    ),
  );
  app.patch<{ Params: { publicId: string }; Body: unknown }>(
    "/api/v1/default-companies/:publicId",
    (request, reply) =>
      performModule(request, reply, resolveContext, (context) =>
        service.update(context, request.params.publicId, request.body),
      ),
  );
}
const inputSchema = z.toJSONSchema(defaultCompanyValuesSchema, { io: "input" });
export const recordSchema = {
  ...inputSchema,
  properties: {
    ...inputSchema.properties,
    public_id: { type: "string", pattern: "^[a-z0-9]{8}$" },
    companyName: { type: "string" },
    financialYearName: { type: "string" },
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
    operationId: "defaultCompany" + action,
    tags: ["DefaultCompany"],
    description:
      "Permission: master/default-company:" +
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
export const defaultCompanyOpenApiPaths = {
  '/api/v1/default-companies/page':{get:modulePageOpenApi('defaultcompanyPage',["name","companyId","financialYearId","landingApp","active"])},
  "/api/v1/default-companies": {
    get: operation("List", false, { type: "array", items: recordSchema }),
    post: { ...operation("Create", true, recordSchema, "201"), requestBody },
  },
  "/api/v1/default-companies/{publicId}": {
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

export function registerOrganisationContextRoutes(
  app: FastifyInstance,
  db: Kysely<Database>,
  resolveContext: ContextResolver,
) {
  app.get("/api/v1/organisation-context", (request, reply) =>
    performModule(request, reply, resolveContext, (context) =>
      getOrganisationContext(db, context),
    ),
  );
  app.get("/api/v1/default-companies/current", (request, reply) =>
    performModule(request, reply, resolveContext, (context) =>
      getCurrentDefaultCompany(db, context),
    ),
  );
}
Object.assign(defaultCompanyOpenApiPaths, {
  "/api/v1/organisation-context": {
    get: {
      operationId: "getOrganisationContext",
      tags: ["DefaultCompany"],
      description:
        "Requires master/default-company:read, master/company:read and master/financial-year:read. Configure an active default first.",
      security: [{ bearerAuth: [] }, { cookieAuth: [] }],
      responses: {
        "200": {
          description: "Scoped organisation context",
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["defaults", "company", "financialYear"],
                properties: {
                  defaults: recordSchema,
                  company: companySchema,
                  financialYear: yearSchema,
                },
              },
            },
          },
        },
        "401": { description: "Authentication required" },
        "403": { description: "Permission denied" },
        "404": { description: "Default not configured" },
        "409": { description: "Selected company or year inactive" },
      },
    },
  },
  "/api/v1/default-companies/current": {
    get: { ...operation("Current", false, recordSchema) },
  },
});
