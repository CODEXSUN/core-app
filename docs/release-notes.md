# v-0.1.4

Reduce Billing's six Core context reads to one authenticated aggregate with tenant-scoped module permissions and validated company/year selections. Preserve write-time validation and Billing-owned actor policies. Expand dashboard content width with responsive padding. Bound transient PostgreSQL startup waiting without running migrations/seeds; incompatible schema/configuration remains fatal. Startup failure closes the connection pool.

Typecheck/build, 14 unit/tool tests and 46 PostgreSQL checks pass. No schema or data migration. Shared dependency pins and successful tagged workflow/manifest are required before CodeShip deployment. Production latency and mobile visual checks are not inferred from source tests.
