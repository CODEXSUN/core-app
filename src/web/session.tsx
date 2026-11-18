import {appFetch} from './platform-client.ts';
import { useState } from "react";
import {
  Button,
  Input,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@workspace/ui";
import {
  UpsertForm,
  UpsertFormField,
  UpsertFormSection,
  UpsertFormSave,
} from "@workspace/ui/blocks/upsert-form";

export type WorkspaceSession = {
  actorId: string;
  tenantId: string;
  permissions: string[];
};
export async function getSession(): Promise<{
  context: WorkspaceSession | null;
  localAccess: boolean;
}> {
  const response = await appFetch("/api/v1/session", {
    credentials: "same-origin",
    cache: "no-store",
  });
  if (!response.ok)
    throw new Error("Workspace access is temporarily unavailable.");
  return response.json();
}
export function WorkspaceAccess({onConnected}:{localAccess:boolean;onConnected:()=>void}){return <Button onClick={onConnected}>Retry workspace connection</Button>;}
