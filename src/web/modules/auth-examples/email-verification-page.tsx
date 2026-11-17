import {
  EmailVerificationPage,
  type EmailVerificationPageProps,
} from "@workspace/ui/blocks/auth/email-verification-page";
export function EmailVerificationTemplate(
  props: Pick<
    EmailVerificationPageProps,
    "onSubmit" | "onResend" | "resendDisabled" | "busy" | "error"
  >,
) {
  return (
    <EmailVerificationPage
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
// App validates the expiring code, applies rate limits and sets resendDisabled during cooldown.
// Missing onResend disables resend. Supply neutral responses; never log codes or enable accounts locally.

// Required fields have linked helper text and inline light-red errors on blur/invalid submit.
// busy=false by default; set busy during requests, preserve values on failure and supply safe error text.

// role is a visual badge only (user | admin | super-admin); app/server permissions remain authoritative.
// Supply app-owned light/dark logo URLs; logoDarkSrc falls back to logoSrc when omitted.
