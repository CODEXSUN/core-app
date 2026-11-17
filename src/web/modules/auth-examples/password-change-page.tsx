import {
  PasswordChangePage,
  type PasswordChangePageProps,
} from "@workspace/ui/blocks/auth/password-change-page";
export function ChangePasswordTemplate(
  props: Pick<PasswordChangePageProps, "onSubmit" | "busy" | "error">,
) {
  return (
    <PasswordChangePage
      {...props}
      brandName="Codebiz"
      logoSrc="/logo/logo.svg"
      logoDarkSrc="/logo/logo-dark.svg"
      role="user"
      embedded={false}
      backHref="/settings"
      minLength={8}
    />
  );
}
// onSubmit receives { currentPassword, newPassword }; app reauthenticates the signed-in user.
// Enforce server password policy, session protection and success/error handling. Never log secrets.

// Required fields have linked helper text and inline light-red errors on blur/invalid submit.
// busy=false by default; set busy during requests, preserve values on failure and supply safe error text.

// role is a visual badge only (user | admin | super-admin); app/server permissions remain authoritative.
// Supply app-owned light/dark logo URLs; logoDarkSrc falls back to logoSrc when omitted.
