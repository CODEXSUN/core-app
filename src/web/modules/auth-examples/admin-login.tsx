import {
  LoginPage,
  type LoginPageProps,
} from "@workspace/ui/blocks/auth/login-page";

export function AdminLoginTemplate(
  props: Pick<
    LoginPageProps,
    "onSubmit" | "busy" | "error" | "onProviderLogin"
  >,
) {
  return (
    <LoginPage
      {...props}
      brandName="Codebiz"
      logoSrc="/logo/logo.svg"
      logoDarkSrc="/logo/logo-dark.svg"
      role="admin"
      title="Administrator sign in"
      description="Use an administrator account for this isolated desk."
      variant="v1"
      embedded={false}
      minLength={8}
      forgotHref="/password/forgot"
      registerHref={null}
    />
  );
}
// Required fields, linked helper text, inline validation and disabled actions during busy are shared.
// Defaults: v1, embedded=false, busy=false, minLength=8; v2 providers require onProviderLogin.
// Title/route configuration grants no permissions. App authenticates and authorizes the correct role.
// Supply safe errors and success navigation. Never log passwords or enable production development login.

// role is a visual badge only (user | admin | super-admin); app/server permissions remain authoritative.
// Supply app-owned light/dark logo URLs; logoDarkSrc falls back to logoSrc when omitted.
