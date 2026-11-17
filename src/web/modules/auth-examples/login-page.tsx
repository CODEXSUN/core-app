import {
  LoginPage,
  type LoginPageProps,
} from "@workspace/ui/blocks/auth/login-page";

export function LoginTemplate(
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
      role="user"
      title="Welcome"
      description="Sign in to your workspace."
      variant="v1"
      embedded={false}
      minLength={8}
      forgotHref="/password/forgot"
      registerHref="/register"
    />
  );
}
// Defaults: v1, embedded=false, busy=false, minLength=8, devLoginEnabled=false.
// Required username/email and password use linked helpers and inline light-red validation on blur/submit.
// App owns authentication and server policy; configure minLength for existing-account policy.
// v2 provider actions require onProviderLogin; absent callbacks disable them.
// Optional onDevLogin requires devLoginEnabled; never enable it in production.
// Do not log credentials. Return safe error text and navigate after real success.

// role is a visual badge only (user | admin | super-admin); app/server permissions remain authoritative.
// Supply app-owned light/dark logo URLs; logoDarkSrc falls back to logoSrc when omitted.
