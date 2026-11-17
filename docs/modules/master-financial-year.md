# financial-year module

Calendar periods, unique names/ranges and one current active year per tenant.

Tenant-owned master with List, Show, New and Edit. Permissions: master/financial-year:read and master/financial-year:write. Creation returns Show; Save after Edit returns Show. Cancel New returns List; Cancel Edit returns Show through the shared dirty-input guard.

Deletion and restoration are intentionally unsupported. Active state preserves records and historical references. This module owns its coded PostgreSQL migration and no-required-data seeder. See ../reference-adaptation.md and ../billing-api.md for fields and contracts.
