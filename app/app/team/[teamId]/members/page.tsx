import { type Id } from "@/convex/_generated/dataModel";
import { MembersView } from "@/components/views/members-view";

export default async function MembersPage({ params }: { params: Promise<{ teamId: string }> }) {
  const { teamId } = await params;
  return <MembersView teamId={teamId as Id<"teams">} />;
}
