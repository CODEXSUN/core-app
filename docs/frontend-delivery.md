# Frontend delivery

Follow central governance's Clean frontend delivery guide. Reuse shared UI, keep contracts/API data and fixtures outside rendering, and lazy-load heavy route modules with stable loading/error recovery. The Vite template injects shared theme initialization before styling; keep its storage key matched to DesignSystemProvider.

Optional src/web/modules/auth-examples/ compositions use shared Codexsun-derived login/register/recovery pages. They do not enable authentication or send emails. Supply secure app-owned callbacks and real busy/error state. Do not log credentials.

Use AsyncState/ContentBoundary for asynchronous content and ConfirmAction for explicit actions when appropriate. Add no-op provider buttons only as disabled UI, never as apparently working authentication. Verify direct URLs, copyable examples, keyboard behavior, error states and production build sizes. Record actual checks and limits in docs/work-record.md. Excluded apps must not be rebuilt.

## Password lifecycle — template v13

Optional typed auth-examples now include password-reset-page, password-change-page and email-verification-page through their real shared public imports. They expose app-owned submit, busy/error state and resend/cooldown options; password helpers and confirmation are built in. Follow central frontend-delivery.md for server validation, expiring single-use tokens/codes, reauthentication and neutral responses. No auth backend or automatic existing-app migration is enabled.

## Audited auth pattern — template v14

Nine optional auth compositions now match UIUX, including role-specific login examples. Use shared helpers, linked inline errors and light-red rings; registration includes password confirmation. Login/Register support configurable minLength (default 8), v1/v2 and busy/error state. Optional username/mobile remain optional. Shared fields handle native constraint feedback; apps enforce all server policies. Read central frontend-delivery.md for the complete Page Template matrix. Typed examples are integrations, not an enabled auth backend.

## Auth app branding — template v15

All Page Templates reuse the app logo through logoSrc, logoDarkSrc and optional logoAlt, with brandName beneath it. UIUX uses the same /logo/logo.svg and /logo/logo-dark.svg files as the shell. Custom dark logos fall back to logoSrc when omitted. Supply accessible alt text and fixed image dimensions.

role defaults to user. User shows a person badge, admin a shield, and super-admin a crown, with separate tones and accessible labels. Admin Login and Super Admin Login configure their role; all other gallery pages use user. All six shared auth blocks accept these props for app-owned lifecycle contexts. This is visual identity only; never infer permissions from a badge. Generated examples show explicit logo URLs and role configuration.
