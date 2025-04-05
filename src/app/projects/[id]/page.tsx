import { ProjectDetails } from "@/features/ProjectDetails";

export default async function ProjectDetailsPage({ params }: { params: { id: string } }) {
  const paramsData = await Promise.resolve(params);
  const id = paramsData.id;
  
  return <ProjectDetails projectId={id} />;
  
} 