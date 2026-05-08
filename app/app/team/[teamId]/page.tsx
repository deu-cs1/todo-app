import { TeamView } from "@/components/views/team-view";
import { type Id } from "@/convex/_generated/dataModel";

export default async function TeamPage({ params }: { params: Promise<{ teamId: string }> }) {
  const { teamId } = await params;
  return <TeamView teamId={teamId as Id<"teams">} />;
}
