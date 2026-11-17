import { SettingsNav } from "@workspace/ui/blocks/settings-nav";
import { AppearanceSettings, Button, useDesignSystem } from "@workspace/ui";

export default function SettingsPage() {
  const { reset } = useDesignSystem();
  return (
    <>
      <div>
        <h1 className="text-2xl font-semibold">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Manage how this workspace looks on your device.
        </p>
      </div>
      <div className="grid items-start gap-5 md:grid-cols-[15rem_minmax(0,1fr)]">
        <SettingsNav
          items={[{ id: "appearance", label: "Appearance" }]}
          value="appearance"
          onValueChange={() => {}}
        />
        <div className="space-y-5">
          <AppearanceSettings />
          <Button variant="outline" onClick={reset}>
            Reset defaults
          </Button>
        </div>
      </div>
    </>
  );
}
