# v-0.1.7

Replace eager full relationship catalogue reads with on-demand 25-row reference pickers, selected-record resolution, search, exact totals, cancellation and explicit retry. Product, Contact, ordinary relation forms, bank and address fields preserve inactive historical labels and existing permissions/save validation. Exact parent public-ID constraints preserve address cascades before count/page; bulk APIs remain compatible.

The measured former Product form requested 10,387,901 bytes across seven catalogues, each failing the gateway byte limit. Browser fixtures now make zero eager catalogue requests and bounded pages at most 2,146 bytes. Verified 32 unit/tool and 49 PostgreSQL checks, plus actual forms with frozen published UI at 360/768/1440. No schema migration, data reset or seed; unchanged published dependency pins. Concurrent Zetro home-page work is excluded. Production throughput is not inferred from fixture tests.
