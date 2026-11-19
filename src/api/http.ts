import { ZodError } from "zod";
import type { FastifyReply, FastifyRequest } from "fastify";
import {
  ModuleAccessError,
  type ContextResolver,
  type ModuleContext,
} from "./database/context.ts";

export class ConflictError extends Error {}
export class ModulePageSizeError extends Error {}
export async function performModule(
  request: FastifyRequest,
  reply: FastifyReply,
  resolveContext: ContextResolver,
  action: (context: ModuleContext) => Promise<unknown>,
  status = 200,
) {
  try {
    const context = await resolveContext(request);
    if (!context)
      return reply
        .code(401)
        .send({ message: "Connect to your workspace to continue." });
    const result = await action(context);
    if (result === undefined)
      return reply.code(404).send({ message: "Record not found." });
    return reply.code(status).send(result);
  } catch (error) {
    if(error instanceof ModulePageSizeError)return reply.code(413).send({message:'This page is too large. Choose a smaller page size.'});
    if (error instanceof ModuleAccessError)
      return reply.code(403).send({ message: "Permission denied." });
    if (error instanceof ZodError)
      return reply
        .code(400)
        .send({
          message: "Check the highlighted values.",
          fields: Object.fromEntries(
            error.issues.map((issue) => [issue.path.join("."), issue.message]),
          ),
        });
    if (error instanceof ConflictError)
      return reply.code(409).send({ message: error.message });
    if ((error as { code?: string })?.code === "23505")
      return reply
        .code(409)
        .send({
          message:
            "A record with this code, name or date range already exists.",
        });
    return reply
      .code(503)
      .send({
        message: "Records are temporarily unavailable. Please try again.",
      });
  }
}
