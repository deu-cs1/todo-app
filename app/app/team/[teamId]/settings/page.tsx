import { AppShell } from "@/components/app-shell/app-shell";
import { Button } from "@/components/ui/button";

export default function SettingsPage() {
  return (
    <AppShell title="Settings" eyebrow="Launch Team">
      <div className="max-w-2xl rounded-xl border border-border bg-surface p-6">
        <label className="block text-sm font-semibold">
          Team name
          <input className="mt-2 h-11 w-full rounded-lg border border-border bg-background px-3" defaultValue="Launch Team" />
        </label>
        <div className="mt-5 flex justify-end">
          <Button>Save changes</Button>
        </div>
      </div>
    </AppShell>
  );
}
