# Routes and Navigation

Before implementing module routing, follow [Central Governance](../../../mcp-governance/docs/governance.md) and its Routes and navigation guide. Keep the detailed rules centralized there.

- Use `/api/v1` for module API calls and server routes; ordinary browser pages use clean paths such as `/projects`, `/projects/{projectId}`, and `/settings/appearance`.
- Serve actual API documentation at `/api/docs` and its OpenAPI specification at `/api/openapi.json` when that integration is implemented. API paths remain visible there and in network requests.
- Keep supported search, filters, sorting, and pagination in query parameters. Direct links, refresh, Back, and Forward must restore the screen and its navigation/breadcrumbs.
- Reuse shared UIUX layout/components and plain, consistent labels. Validate URL inputs and enforce scope/permissions server-side.
- These instructions do not implement a router or OpenAPI server. Wire and verify those features in the authorized module task; record actual results in the work record.
