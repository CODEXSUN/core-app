import {
  RegisterPage,
  type RegisterPageProps,
} from "@workspace/ui/blocks/auth/register-page";

export function RegisterTemplate(
  props: Pick<RegisterPageProps, "onSubmit" | "busy" | "error">,
) {
  return (
    <RegisterPage
      {...props}
      brandName="Codebiz"
      logoSrc="/logo/logo.svg"
      logoDarkSrc="/logo/logo-dark.svg"
      role="user"
      variant="v1"
      embedded={false}
      minLength={8}
      loginHref="/login"
    />
  );
}
// Defaults: v1, embedded=false, busy=false, minLength=8. Required name/email/password/confirmation.
// Linked helpers, native constraints and matching confirmation block invalid submission.
// v2 adds optional username (3+ non-space characters) and mobile (app validates phone format).
// onSubmit(name,email,password,username?,mobile?); confirmation is never sent to the API.
// App owns registration, password policy and safe errors; never log passwords.

// role is a visual badge only (user | admin | super-admin); app/server permissions remain authoritative.
// Supply app-owned light/dark logo URLs; logoDarkSrc falls back to logoSrc when omitted.
