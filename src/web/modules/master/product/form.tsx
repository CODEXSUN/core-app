import { useEffect, useRef, useState } from "react";
import { Input, Textarea, Switch } from "@workspace/ui";
import {
  UpsertForm,
  UpsertFormField,
  UpsertFormSection,
  UpsertFormValidationSummary,
} from "@workspace/ui/blocks/upsert-form";
import {ReferencePicker} from "../../shared/reference-picker";
import { FormSelect } from "@workspace/ui/blocks/form-controls/select";
import { FormDatePicker } from "@workspace/ui/blocks/form-controls/date-picker";
import { useUnsavedChangesGuard } from "@workspace/ui/blocks/unsaved-changes-guard";
import {
  productValuesSchema,
  type Product,
  type ProductValues,
} from "../../../../../contracts/product";
import { useNavigation } from "../../../navigation";
import {loadProductTypeReferencePage,getProductTypeReference} from "../../common/product-type";
import {loadProductCategoryReferencePage,getProductCategoryReference} from "../../common/product-category";
import {loadProductGroupReferencePage,getProductGroupReference} from "../../common/product-group";
import {loadHsnCodeReferencePage,getHsnCodeReference} from "../../common/hsn-code";
import {loadUnitReferencePage,getUnitReference} from "../../common/unit";
import {loadTaxReferencePage,getTaxReference} from "../../common/tax";
import {loadBrandReferencePage,getBrandReference} from "../../common/brand";

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

  return (
    <>
      {guard.dialog}
      <UpsertFormValidationSummary errors={errors} idPrefix={id} />
      <UpsertForm
        id={id}
        noValidate
        saving={saving}
        error={error}
        onSubmit={async (event) => {
          event.preventDefault();
          if (pending.current || saving) return;
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
            <ReferencePicker
              ariaLabel="Product type"
              value={values.typeId}
              loadPage={loadProductTypeReferencePage}
              loadSelected={getProductTypeReference}
              onValueChange={(value)=>{setValues(previous=>({...previous,typeId:value}));setErrors(previous=>{const next={...previous};delete next.typeId;return next;});setError('');}}
            />
          </UpsertFormField>
          <UpsertFormField
            idPrefix={id}
            name="productCategoryId"
            label="Category"
            helper="Choose an authorized record."
            error={errors.productCategoryId}
          >
            <ReferencePicker
              ariaLabel="Category"
              value={values.productCategoryId}
              loadPage={loadProductCategoryReferencePage}
              loadSelected={getProductCategoryReference}
              onValueChange={(value)=>{setValues(previous=>({...previous,productCategoryId:value}));setErrors(previous=>{const next={...previous};delete next.productCategoryId;return next;});setError('');}}
            />
          </UpsertFormField>
          <UpsertFormField
            idPrefix={id}
            name="productGroupId"
            label="Group"
            helper="Choose an authorized record."
            error={errors.productGroupId}
          >
            <ReferencePicker
              ariaLabel="Group"
              value={values.productGroupId}
              loadPage={loadProductGroupReferencePage}
              loadSelected={getProductGroupReference}
              onValueChange={(value)=>{setValues(previous=>({...previous,productGroupId:value}));setErrors(previous=>{const next={...previous};delete next.productGroupId;return next;});setError('');}}
            />
          </UpsertFormField>
          <UpsertFormField
            idPrefix={id}
            name="hsnCodeId"
            label="HSN code"
            helper="Choose an authorized record."
            error={errors.hsnCodeId}
          >
            <ReferencePicker
              ariaLabel="HSN code"
              value={values.hsnCodeId}
              loadPage={loadHsnCodeReferencePage}
              loadSelected={getHsnCodeReference}
              onValueChange={(value)=>{setValues(previous=>({...previous,hsnCodeId:value}));setErrors(previous=>{const next={...previous};delete next.hsnCodeId;return next;});setError('');}}
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
            <ReferencePicker
              ariaLabel="Unit"
              value={values.unitId}
              loadPage={loadUnitReferencePage}
              loadSelected={getUnitReference}
              onValueChange={(value)=>{setValues(previous=>({...previous,unitId:value}));setErrors(previous=>{const next={...previous};delete next.unitId;return next;});setError('');}}
            />
          </UpsertFormField>
          <UpsertFormField
            idPrefix={id}
            name="taxId"
            label="Tax"
            helper="Choose an authorized record."
            error={errors.taxId}
          >
            <ReferencePicker
              ariaLabel="Tax"
              value={values.taxId}
              loadPage={loadTaxReferencePage}
              loadSelected={getTaxReference}
              onValueChange={(value)=>{setValues(previous=>({...previous,taxId:value}));setErrors(previous=>{const next={...previous};delete next.taxId;return next;});setError('');}}
            />
          </UpsertFormField>
          <UpsertFormField
            idPrefix={id}
            name="brandId"
            label="Brand"
            helper="Choose an authorized record."
            error={errors.brandId}
          >
            <ReferencePicker
              ariaLabel="Brand"
              value={values.brandId}
              loadPage={loadBrandReferencePage}
              loadSelected={getBrandReference}
              onValueChange={(value)=>{setValues(previous=>({...previous,brandId:value}));setErrors(previous=>{const next={...previous};delete next.brandId;return next;});setError('');}}
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
