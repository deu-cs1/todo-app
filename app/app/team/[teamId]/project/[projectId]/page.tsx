import { type Id } from "@/convex/_generated/dataModel";
import { ProjectView } from "@/components/views/project-view";

export default async function ProjectPage({ params }: { params: Promise<{ teamId: string; projectId: string }> }) {
  const { teamId, projectId } = await params;
  return <ProjectView teamId={teamId as Id<"teams">} projectId={projectId as Id<"projects">} />;
}
