import {
  PasswordResetPage,
  type PasswordResetPageProps,
} from "@workspace/ui/blocks/auth/password-reset-page";
export function ResetPasswordTemplate(
  props: Pick<PasswordResetPageProps, "onSubmit" | "busy" | "error">,
) {
  return (
    <PasswordResetPage
      {...props}
      brandName="Codebiz"
      logoSrc="/logo/logo.svg"
      logoDarkSrc="/logo/logo-dark.svg"
      role="user"
      embedded={false}
      backHref="/login"
      minLength={8}
    />
  );
}
// App validates a single-use, expiring reset token and enforces password policy on the server.
// Never log passwords/tokens. Supply success navigation and safe expired-link recovery in the app.

// Required fields have linked helper text and inline light-red errors on blur/invalid submit.
// busy=false by default; set busy during requests, preserve values on failure and supply safe error text.

// role is a visual badge only (user | admin | super-admin); app/server permissions remain authoritative.
// Supply app-owned light/dark logo URLs; logoDarkSrc falls back to logoSrc when omitted.
