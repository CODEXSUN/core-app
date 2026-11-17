import { Button } from "@workspace/ui/components/button";
import { Toaster, toast } from "@workspace/ui/components/sonner";

// Mount once beneath DesignSystemProvider at the app root, never per route.
export function AppNotifications() {
  return <Toaster />;
}

export function ToastFeedbackExample() {
  return (
    <div className="flex flex-wrap gap-2">
      <Button
        variant="outline"
        onClick={() =>
          toast.success("Preview saved", {
            description: "Sample feedback only.",
          })
        }
      >
        Success
      </Button>
      <Button
        variant="outline"
        onClick={() =>
          toast.error("Preview request failed", {
            description: "Please try again.",
          })
        }
      >
        Error
      </Button>
      <Button
        variant="outline"
        onClick={() => toast.info("Workspace information")}
      >
        Information
      </Button>
      <Button
        variant="outline"
        onClick={() => toast.warning("Review before continuing")}
      >
        Warning
      </Button>
      <Button
        variant="outline"
        onClick={() =>
          toast.promise(new Promise((resolve) => setTimeout(resolve, 700)), {
            loading: "Running preview…",
            success: "Preview completed",
            error: "Preview failed",
          })
        }
      >
        Loading to success
      </Button>
      <Button
        variant="outline"
        onClick={() =>
          toast("Sample update", {
            action: {
              label: "View",
              onClick: () => toast.info("Preview action selected"),
            },
          })
        }
      >
        With action
      </Button>
      <Button variant="ghost" onClick={() => toast.dismiss()}>
        Dismiss all
      </Button>
    </div>
  );
}
// Defaults: bottom-right, 4 seconds, 3 visible, close button, 8px gap, shared theme.
// Apps supply real operations. Use toast.promise(apiCall, messages) for async work.
// Do not toast on every render, duplicate hosts or expose sensitive API errors.
// Keep field errors inline; a toast is supplemental feedback, never confirmation/authorization.
