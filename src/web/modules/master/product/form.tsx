import { useEffect, useRef, useState } from "react";
import { Input, Textarea, Switch } from "@workspace/ui";
import {
  UpsertForm,
  UpsertFormField,
  UpsertFormSection,
  UpsertFormValidationSummary,
} from "@workspace/ui/blocks/upsert-form";
import { FormLookup } from "@workspace/ui/blocks/form-controls/lookup";
import { FormSelect } from "@workspace/ui/blocks/form-controls/select";
import { FormDatePicker } from "@workspace/ui/blocks/form-controls/date-picker";
import { useUnsavedChangesGuard } from "@workspace/ui/blocks/unsaved-changes-guard";
import {
  productValuesSchema,
  type Product,
  type ProductValues,
} from "../../../../../contracts/product";
import { useNavigation } from "../../../navigation";
import { loadProductType } from "../../common/product-type";
import { loadProductCategory } from "../../common/product-category";
import { loadProductGroup } from "../../common/product-group";
import { loadHsnCode } from "../../common/hsn-code";
import { loadUnit } from "../../common/unit";
import { loadTax } from "../../common/tax";
import { loadBrand } from "../../common/brand";

type Props = {
  id: string;
  record?: Product;
  saving: boolean;
  onSavingChange: (saving: boolean) => void;
  onSave: (values: ProductValues) => Promise<void>;
};
export function ProductForm({
  id,
  record,
  saving,
  onSavingChange,
  onSave,
}: Props) {
  const defaults: ProductValues = {
    name: "",
    typeId: "",
    productCategoryId: "",
    productGroupId: "",
    hsnCodeId: "",
    unitId: "",
    taxId: "",
    brandId: "",
    openingStock: "0.0000",
    openingRate: "0.0000",
    description: "",
    active: true,
  };
  const initial = useRef<ProductValues>(
    record
      ? productValuesSchema.parse(
          Object.fromEntries(
            Object.keys(defaults).map((key) => [
              key,
              record[key as keyof Product],
            ]),
          ),
        )
      : defaults,
  );
  const [values, setValues] = useState(initial.current);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState("");
  const [lookups, setLookups] = useState<
    Record<string, { value: string; label: string }[]>
  >({});
  const [lookupError, setLookupError] = useState("");
  const [lookupLoading, setLookupLoading] = useState(true);
  const pending = useRef(false);
  const { setGuard } = useNavigation();
  const guard = useUnsavedChangesGuard({
    dirty: JSON.stringify(values) !== JSON.stringify(initial.current),
    busy: saving,
  });
  useEffect(() => {
    setGuard(
      JSON.stringify(values) !== JSON.stringify(initial.current) || saving
        ? guard.requestNavigation
        : null,
    );
    return () => setGuard(null);
  }, [values, saving, guard.requestNavigation, setGuard]);
  useEffect(() => {
    let active = true;
    Promise.all([
      loadProductType(),
      loadProductCategory(),
      loadProductGroup(),
      loadHsnCode(),
      loadUnit(),
      loadTax(),
      loadBrand(),
    ])
      .then(
        ([
          typeIdRecords,
          productCategoryIdRecords,
          productGroupIdRecords,
          hsnCodeIdRecords,
          unitIdRecords,
          taxIdRecords,
          brandIdRecords,
        ]) => {
          if (active)
            setLookups({
              typeId: typeIdRecords
                .filter(
                  (record) =>
                    record.active ||
                    record.public_id === initial.current.typeId,
                )
                .map((record) => ({
                  value: record.public_id,
                  label: record.name,
                })),
              productCategoryId: productCategoryIdRecords
                .filter(
                  (record) =>
                    record.active ||
                    record.public_id === initial.current.productCategoryId,
                )
                .map((record) => ({
                  value: record.public_id,
                  label: record.name,
                })),
              productGroupId: productGroupIdRecords
                .filter(
                  (record) =>
                    record.active ||
                    record.public_id === initial.current.productGroupId,
                )
                .map((record) => ({
                  value: record.public_id,
                  label: record.name,
                })),
              hsnCodeId: hsnCodeIdRecords
                .filter(
                  (record) =>
                    record.active ||
                    record.public_id === initial.current.hsnCodeId,
                )
                .map((record) => ({
                  value: record.public_id,
                  label: record.name,
                })),
              unitId: unitIdRecords
                .filter(
                  (record) =>
                    record.active ||
                    record.public_id === initial.current.unitId,
                )
                .map((record) => ({
                  value: record.public_id,
                  label: record.name,
                })),
              taxId: taxIdRecords
                .filter(
                  (record) =>
                    record.active || record.public_id === initial.current.taxId,
                )
                .map((record) => ({
                  value: record.public_id,
                  label: record.name,
                })),
              brandId: brandIdRecords
                .filter(
                  (record) =>
                    record.active ||
                    record.public_id === initial.current.brandId,
                )
                .map((record) => ({
                  value: record.public_id,
                  label: record.name,
                })),
            });
        },
      )
      .catch(() => {
        if (active)
          setLookupError(
            "Unable to load reference choices. Check access or reload this form.",
          );
      })
      .finally(() => {
        if (active) setLookupLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);
  return (
    <>
      {guard.dialog}
      <UpsertFormValidationSummary errors={errors} idPrefix={id} />
      <UpsertForm
        id={id}
        noValidate
        saving={saving}
        error={error || lookupError}
        onSubmit={async (event) => {
          event.preventDefault();
          if (pending.current || saving) return;
          if (lookupLoading || lookupError) {
            setError(lookupError || "Wait for reference choices to load.");
            return;
          }
          const parsed = productValuesSchema.safeParse(values);
          setErrors({});
          setError("");
          if (!parsed.success) {
            const fields = Object.fromEntries(
              parsed.error.issues.map((issue) => [
                String(issue.path[0] ?? "name"),
                issue.message,
              ]),
            );
            setErrors(fields);
            document.getElementById(id + "-" + Object.keys(fields)[0])?.focus();
            return;
          }
          pending.current = true;
          onSavingChange(true);
          try {
            await onSave(parsed.data);
            initial.current = parsed.data;
          } catch (cause) {
            setError(
              cause instanceof Error ? cause.message : "Unable to save.",
            );
          } finally {
            pending.current = false;
            onSavingChange(false);
          }
        }}
      >
        <UpsertFormSection label="Details">
          <UpsertFormField
            idPrefix={id}
            name="name"
            label="Name"
            helper="Enter name."
            error={errors.name}
            required
          >
            <Input
              value={values.name}
              onChange={(event) =>
                setValues((previous) => ({
                  ...previous,
                  name: event.target.value,
                }))
              }
            />
          </UpsertFormField>
          <UpsertFormField
            idPrefix={id}
            name="typeId"
            label="Product type"
            helper="Choose an authorized record."
            error={errors.typeId}
          >
            <FormLookup
              ariaLabel="Product type"
              value={values.typeId}
              options={lookups.typeId ?? []}
              allowTextValue={false}
              onValueChange={(value) =>
                setValues((previous) => ({ ...previous, typeId: value }))
              }
            />
          </UpsertFormField>
          <UpsertFormField
            idPrefix={id}
            name="productCategoryId"
            label="Category"
            helper="Choose an authorized record."
            error={errors.productCategoryId}
          >
            <FormLookup
              ariaLabel="Category"
              value={values.productCategoryId}
              options={lookups.productCategoryId ?? []}
              allowTextValue={false}
              onValueChange={(value) =>
                setValues((previous) => ({
                  ...previous,
                  productCategoryId: value,
                }))
              }
            />
          </UpsertFormField>
          <UpsertFormField
            idPrefix={id}
            name="productGroupId"
            label="Group"
            helper="Choose an authorized record."
            error={errors.productGroupId}
          >
            <FormLookup
              ariaLabel="Group"
              value={values.productGroupId}
              options={lookups.productGroupId ?? []}
              allowTextValue={false}
              onValueChange={(value) =>
                setValues((previous) => ({
                  ...previous,
                  productGroupId: value,
                }))
              }
            />
          </UpsertFormField>
          <UpsertFormField
            idPrefix={id}
            name="hsnCodeId"
            label="HSN code"
            helper="Choose an authorized record."
            error={errors.hsnCodeId}
          >
            <FormLookup
              ariaLabel="HSN code"
              value={values.hsnCodeId}
              options={lookups.hsnCodeId ?? []}
              allowTextValue={false}
              onValueChange={(value) =>
                setValues((previous) => ({ ...previous, hsnCodeId: value }))
              }
            />
          </UpsertFormField>
          <UpsertFormField
            idPrefix={id}
            name="unitId"
            label="Unit"
            helper="Choose an authorized record."
            error={errors.unitId}
            required
          >
            <FormLookup
              ariaLabel="Unit"
              value={values.unitId}
              options={lookups.unitId ?? []}
              allowTextValue={false}
              onValueChange={(value) =>
                setValues((previous) => ({ ...previous, unitId: value }))
              }
            />
          </UpsertFormField>
          <UpsertFormField
            idPrefix={id}
            name="taxId"
            label="Tax"
            helper="Choose an authorized record."
            error={errors.taxId}
          >
            <FormLookup
              ariaLabel="Tax"
              value={values.taxId}
              options={lookups.taxId ?? []}
              allowTextValue={false}
              onValueChange={(value) =>
                setValues((previous) => ({ ...previous, taxId: value }))
              }
            />
          </UpsertFormField>
          <UpsertFormField
            idPrefix={id}
            name="brandId"
            label="Brand"
            helper="Choose an authorized record."
            error={errors.brandId}
          >
            <FormLookup
              ariaLabel="Brand"
              value={values.brandId}
              options={lookups.brandId ?? []}
              allowTextValue={false}
              onValueChange={(value) =>
                setValues((previous) => ({ ...previous, brandId: value }))
              }
            />
          </UpsertFormField>
          <UpsertFormField
            idPrefix={id}
            name="openingStock"
            label="Opening quantity"
            helper="Use up to four decimal places."
            error={errors.openingStock}
          >
            <Input
              inputMode="decimal"
              value={values.openingStock}
              onChange={(event) =>
                setValues((previous) => ({
                  ...previous,
                  openingStock: event.target.value,
                }))
              }
            />
          </UpsertFormField>
          <UpsertFormField
            idPrefix={id}
            name="openingRate"
            label="Opening rate"
            helper="Use up to four decimal places."
            error={errors.openingRate}
          >
            <Input
              inputMode="decimal"
              value={values.openingRate}
              onChange={(event) =>
                setValues((previous) => ({
                  ...previous,
                  openingRate: event.target.value,
                }))
              }
            />
          </UpsertFormField>
          <UpsertFormField
            idPrefix={id}
            name="description"
            label="Description"
            helper="Enter description."
            error={errors.description}
          >
            <Textarea
              value={values.description}
              onChange={(event) =>
                setValues((previous) => ({
                  ...previous,
                  description: event.target.value,
                }))
              }
            />
          </UpsertFormField>
          <UpsertFormField
            idPrefix={id}
            name="active"
            label="Active"
            helper="Enter active."
            error={errors.active}
          >
            <Switch
              aria-label="Active"
              checked={values.active}
              onCheckedChange={(value) =>
                setValues((previous) => ({ ...previous, active: value }))
              }
            />
          </UpsertFormField>
        </UpsertFormSection>
      </UpsertForm>
    </>
  );
}
