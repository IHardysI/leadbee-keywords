import { ProjectDetails } from "@/features/ProjectDetails";

export default function ProjectDetailsPage({ params }: { params: { id: string } }) {
  return <ProjectDetails projectId={params.id} />;
} 