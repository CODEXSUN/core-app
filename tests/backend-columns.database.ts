import test from "node:test";
import assert from "node:assert/strict";
import { writeFileSync } from "node:fs";
import { sql } from "kysely";
import { withTestDatabase } from "./database-harness.ts";
import { coreCases } from "./core-module-cases.ts";

test("all Core editable contract fields persist in the owning table and are returned by create/update/read", async () => {
  await withTestDatabase(async ({ db, app, headersA }) => {
    const rows: Record<string, unknown>[] = [];
    const records = new Map<string, Record<string, any>>();
    for (const module of coreCases) {
      const contract = await import("../contracts/" + module.name + ".ts");
      const camel = module.name.replace(/-([a-z])/g, (_match, letter) =>
        letter.toUpperCase(),
      );
      const schema = contract[camel + "ValuesSchema"];
      assert.ok(schema, module.name + " values contract");
      const values: Record<string, unknown> = { ...module.values };
      for (const ref of module.refs)
        values[ref.field] = records.get(ref.target)!.public_id;
      const response = await app.inject({
        method: "POST",
        url: "/api/v1/" + module.collection,
        headers: headersA,
        payload: values,
      });
      assert.equal(response.statusCode, 201, response.body);
      const record = response.json();
      records.set(module.name, record);
      for (const field of Object.keys(schema.shape))
        assert.ok(field in record, module.name + " must return " + field);
      const expected = schema.parse(values);
      for (const field of Object.keys(schema.shape))
        assert.deepEqual(
          record[field],
          expected[field],
          module.name + "." + field + " create round-trip",
        );
      const edited = {
        ...values,
        name:
          module.name === "currency" ? "XTS" : String(values.name) + " updated",
      };
      const update = await app.inject({
        method: "PATCH",
        url: "/api/v1/" + module.collection + "/" + record.public_id,
        headers: headersA,
        payload: edited,
      });
      assert.equal(update.statusCode, 200, update.body);
      const expectedUpdate = schema.parse(edited);
      for (const field of Object.keys(schema.shape))
        assert.deepEqual(
          update.json()[field],
          expectedUpdate[field],
          module.name + "." + field + " update round-trip",
        );

      const physical = await sql<{
        column_name: string;
        data_type: string;
        is_nullable: string;
        column_default: string | null;
      }>`SELECT column_name,data_type,is_nullable,column_default FROM information_schema.columns WHERE table_schema=current_schema() AND table_name=${module.table} ORDER BY ordinal_position`.execute(
        db,
      );
      const columns = new Set(physical.rows.map((row) => row.column_name));
      for (const field of Object.keys(schema.shape)) {
        const column = field.replace(
          /[A-Z]/g,
          (letter) => "_" + letter.toLowerCase(),
        );
        assert.ok(
          columns.has(column),
          module.name + "." + field + " must persist in " + column,
        );
      }
      for (const field of [
        "id",
        "public_id",
        "tenant_id",
        "active",
        "created_at",
        "updated_at",
        "created_by",
        "updated_by",
        "deleted_at",
        "deleted_by",
      ])
        assert.ok(columns.has(field), module.name + " audit field " + field);
      const detail = await app.inject({
        url: "/api/v1/" + module.collection + "/" + record.public_id,
        headers: headersA,
      });
      assert.equal(detail.statusCode, 200, detail.body);
      assert.deepEqual(detail.json(), update.json());
      rows.push({
        module: module.key,
        table: module.table,
        collection: module.collection,
        editableFields: Object.keys(schema.shape),
        returnedFields: Object.keys(record),
        columns: physical.rows,
      });
    }
    if (process.env.CORE_BACKEND_INVENTORY_OUT)
      writeFileSync(
        process.env.CORE_BACKEND_INVENTORY_OUT,
        JSON.stringify({ schema: 1, modules: rows }, null, 2) + "\n",
      );
    assert.equal(rows.length, 37);
  });
});
