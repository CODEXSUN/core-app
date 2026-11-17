import {
  PasswordForgotPage,
  type PasswordForgotPageProps,
} from "@workspace/ui/blocks/auth/password-forgot-page";

export function RecoveryTemplate(
  props: Pick<PasswordForgotPageProps, "onSubmit" | "busy" | "error">,
) {
  return (
    <PasswordForgotPage
      {...props}
      brandName="Codebiz"
      logoSrc="/logo/logo.svg"
      logoDarkSrc="/logo/logo-dark.svg"
      role="user"
      embedded={false}
      backHref="/login"
    />
  );
}
// App sends the recovery request. Return a neutral response without account enumeration.
// Never put reset tokens/passwords in logs or gallery fixtures. No email is sent by this block.

// Required fields have linked helper text and inline light-red errors on blur/invalid submit.
// busy=false by default; set busy during requests, preserve values on failure and supply safe error text.

// role is a visual badge only (user | admin | super-admin); app/server permissions remain authoritative.
// Supply app-owned light/dark logo URLs; logoDarkSrc falls back to logoSrc when omitted.
