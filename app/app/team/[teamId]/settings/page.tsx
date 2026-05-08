import { type Id } from "@/convex/_generated/dataModel";
import { SettingsView } from "@/components/views/settings-view";

export default async function SettingsPage({ params }: { params: Promise<{ teamId: string }> }) {
  const { teamId } = await params;
  return <SettingsView teamId={teamId as Id<"teams">} />;
}
