# Shared UI integration

Follow the shared frontend guide through this app's central governance instructions.

Before adding UI, inspect the public `@workspace/ui` exports and UIUX examples. Use shared layouts, Master List, Upsert Form, controls and menus. Do not copy component source, styles or interaction logic into this app.

If reusable UI is missing or needs customization:

1. Add or extend the component/control/block in `packages/ui` using reusable props or variants.
2. Export it through a public path and add a UIUX live preview with accurate usage.
3. Check shared behavior and accessibility, then wire this app to the public import.

Keep records, field definitions, product validation, permissions, API calls and callbacks in the app. Do not move business services into shared UI. The generated record/form examples demonstrate app composition, not permission to fork shared implementations.

Check new work for duplicate controls, private-source imports and CSS replacing shared styles. Changes to existing custom apps require their own authorized scope; this template does not migrate them automatically.

See docs/shared-patterns.md and src/web/modules/shared/patterns.example.tsx before adding navigation, progress, activity feeds, record selectors, check output, information panels or clipboard controls. These examples use public shared blocks; they are not local replacements.

Example and helper actions must also use public shared controls. Use Button from @workspace/ui/components/button for actions such as Check date; do not leave native visible button/input/select/textarea replacements in generated examples. Hidden form-data inputs and semantic page structure remain app-owned.

Template v18 mounts one shared Sonner Toaster at the app root. Import toast from @workspace/ui/components/sonner to report app-owned outcomes. See shared/toast-feedback.example.tsx for optional usage; do not mount its AppNotifications example a second time. Shared scrollbars come from the existing stylesheet; no app scrollbar CSS is needed. Keep field errors inline and never toast secrets or claim API success before completion.
