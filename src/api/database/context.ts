import type { FastifyRequest } from "fastify";

export type ModuleContext = {
  actorId: string;
  tenantId: string;
  permissions: readonly string[];
};
export type ContextResolver = (
  request: FastifyRequest,
) => Promise<ModuleContext | null>;
export class ModuleAccessError extends Error {}

export function requireModulePermission(
  context: ModuleContext,
  permission: string,
) {
  if (
    !context?.actorId?.trim() ||
    !context?.tenantId?.trim() ||
    context.actorId.length > 128 ||
    context.tenantId.length > 128 ||
    !context.permissions?.includes(permission)
  ) {
    throw new ModuleAccessError("Permission denied.");
  }
}
// Context resolvers are supplied by the app-owned authentication adapter.
// Client actor/tenant/permission headers are never authoritative.
