import { type Id } from "@/convex/_generated/dataModel";
import { ProjectView } from "@/components/views/project-view";

export default async function ProjectPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  return <ProjectView projectId={projectId as Id<"projects">} />;
}
