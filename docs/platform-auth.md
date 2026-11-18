# Platform login

See the [suite authentication audit](../../platform/docs/auth-gate-rollout.md) for
verified scope, security boundaries and remaining operations.

Use this app's native web/API pair from the central port registry. Start Platform's
ordinary API entry first to preserve its configured databases, then this app's
`npm run dev:api` and `npm run dev:web`. The app's ignored environment holds its
service credential, service ID, trusted browser origins and any required tenant pin.
No app-owned staff passwords or competing user tables are introduced.

`contracts/platform-service.json` is the explicit local registration catalog.
After intentional master resets, use Platform's public service registration/admission
commands; confirm each service's guarded readiness and existing database scope.
Login/startup never executes business migrations. Keep the fixed tenant/data-key
binding for existing single-partition data until a separate client mapping is prepared.

Staff login uses Corporate ID on shared hosts, username/email, password and required
first-password updates. Registered client domains fix the tenant. Sign out revokes
the Platform session. Recovery currently belongs to the workspace administrator.
