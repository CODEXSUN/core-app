# Form integration

Use `RecordForm` with the owning product's record contract and authorized API callback. It inherits the shared form layout, helper/error styles and light-red validation rings.

```tsx
<MainLayout {...shellProps}
  headerBreadcrumbs={[{ label: record ? 'Edit record' : 'New record' }]}
  headerActions={<UpsertFormSave formId="record-form" saving={saving} label="Save record"/>}>
  <div className="p-6">
    <RecordForm key={record?.id ?? 'new'} id="record-form" record={record}
      saving={saving} onSavingChange={setSaving} onSave={saveRecord}/>
  </div>
</MainLayout>
```

The app supplies shellProps, record, saving state and saveRecord; no save endpoint is generated. Match the header and form ID/saving state. Use only one shortcut-enabled form per page. Validate additional fields before calling the API and enforce permissions/validation on the server.

Choose controls by field meaning; do not add irrelevant fields to a product form:

| Field | Shared control |
| --- | --- |
| Text, email, phone, URL, number | Input with appropriate type |
| Long message | Textarea |
| Searchable customer/reference | FormLookup |
| Fixed choices / colored choices | FormSelect |
| Date | FormDatePicker |
| Single choice | RadioGroup / RadioGroupItem |
| Confirmation | Checkbox |
| On/off preference | Switch |
| Bounded numeric range | Input type="range" or Slider |
| Attachment | Input type="file" |
| Related subpanels | FormAnimatedTabs |

Import primitive controls from `@workspace/ui` and form-control blocks from the individual simplified paths below. Wrap each field in UpsertFormField with a helper and optional error; use a unique idPrefix matched by UpsertFormValidationSummary. Native Input/Textarea get label/error associations automatically. Supply ariaLabel and invalid state to custom controls; the field group carries helper/error descriptions. For lookup/date FormData, supply a hidden named input. Date required checks belong to app validation; do not assume the reference picker enforces them.

Shared defaults: compact two-column form, optional related sidebar, app-header Save, Ctrl/Cmd+S, disabled controls while saving, inline errors, linked summary and tight light-red rings. Never copy CSS or introduce a different form design unless explicitly requested. Keep required markers, helper text, keyboard focus and server-error recovery. UIUX Forms previews are the reference for all controls and validation states.

Prefer explicit imports for form-control blocks:

| Control | Public import |
| --- | --- |
| FormLookup | `@workspace/ui/blocks/form-controls/lookup` |
| FormSelect | `@workspace/ui/blocks/form-controls/select` |
| FormDatePicker | `@workspace/ui/blocks/form-controls/date-picker` |
| FormAnimatedTabs | `@workspace/ui/blocks/form-controls/animated-tabs` |

## Typechecked examples

`src/web/modules/records/control-examples/` includes lookup.tsx, select.tsx, date-picker.tsx and animated-tabs.tsx. They use the same audited compositions displayed in UIUX. Choose only relevant examples; no extra screens, APIs or saves are enabled automatically.

Lookup alone supports Create new with an authorized app-owned callback returning the saved ID/label. Select is fixed options only. Date Picker emits ISO dates and needs app-owned required validation and a hidden named value. Animated Tabs demonstrates five tabs, icons/counts and controlled selection with keyboard/reduced-motion support. Helper fields and invalid rings remain shared; do not copy CSS.

## Single-line control standard

Use the shared --control-height token (44px) for text/password/email/number inputs, native/shared Select triggers, autocomplete Lookup, search/column-filter inputs, date-picker triggers and single-line InputGroup/Combobox surfaces. The shared stylesheet owns sizing even inside toolbars, pagination and examples. Do not add per-app compact/tall height overrides or local select/lookup skins. Change the shared token only under explicit design direction.

Select and Lookup share semantic background/border/radius, typography, popup surfaces and focus/invalid styling; apps supply options, data and callbacks. Preserve icon/padding clearance and center icons vertically. Multiline Textarea/rich editors, checkbox/radio/range controls, calendar day cells, icon-only actions and wrapping multi-value chips keep their appropriate dimensions. Native hidden inputs remain hidden. Shared rules preserve disabled states and light-red validation rings. Mobile field text stays 16px to avoid browser input zoom.

## Detail screens and unsaved changes

Use records/detail.tsx (RecordDetailV1) for authorized Show data; use MainLayout headerActions for Edit/Back. records/guarded-form.example.tsx demonstrates a real callback-based save and Cancel guard. Mount the guard dialog once, route all app-owned navigation through requestNavigation and integrate router blocking for history/popstate. Native unload warnings are browser-limited. Keep dirty state on failure, clear it only after real save, and block transitions while saving. See central record-detail-and-navigation.md and the separate UIUX previews.

## File uploads

Optional records/file-upload.tsx composes the public shared FileUpload block. Supply the authorized onUpload callback, forward its AbortSignal, report real progress and resolve a saved {id}. onFilesChange exposes queue status and result IDs for record linking and dirty/busy guards. Defaults are PNG/JPEG/PDF, five files, 5 MB each and manual start. Retry must be idempotent; Cancel/remove do not undo server storage. Revalidate content/permissions on the server. No storage endpoint or simulated uploader is enabled in generated apps. See central file-upload-standard.md and UIUX File Upload for the full contract.
