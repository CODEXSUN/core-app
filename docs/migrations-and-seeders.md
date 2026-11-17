# Persistent modules

Follow the central Migrations and seeders guide through AGENTS.md before adding database modules. Use common/master/business categories, singular module folders, plural tables, explicit module-local migrations/seeders and the minimal routes/service/repository and page/form/services roles. Internal integer identity keys are private; public_id is eight lowercase letters/numbers stored unchanged in unique varchar(32). Standard entity/audit/lifecycle/tenant rules remain server-owned.

Generate with --with-city for a working optional common/city reference module and explicit db:status, db:migrate, db:rollback and db:seed commands. Without either --with-city or --module, no database dependencies, commands, connection or City page are enabled. Creation never installs, starts, migrates or seeds. The optional module docs explain demo policy and disposable database tests.


For any common/master/business module, repeat --module category:singular-name:plural_table at app creation. Each receives its own migration, no-data seeder, backend/frontend files and tests. Generic modules are tenant-scoped and require trusted identity/permissions; they do not inherit the public global City demo policy. Their app-header New/Save/Cancel controls do not grant persistence authority. Do not combine --module with --with-city. See generated docs/modules/ for exact per-module ownership and authorization contracts.
