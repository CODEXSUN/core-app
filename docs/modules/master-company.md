# company module

Company fields, unique tenant code, primary contact methods and structured addresses.

Tenant-owned master with List, Show, New and Edit. Permissions: master/company:read and master/company:write. Creation returns Show; Save after Edit returns Show. Cancel New returns List; Cancel Edit returns Show through the shared dirty-input guard.

Deletion and restoration are intentionally unsupported. Active state preserves records and historical references. This module owns its coded PostgreSQL migration and no-required-data seeder. See ../reference-adaptation.md and ../billing-api.md for fields and contracts.
