"use client";

import React, { useEffect, useState } from "react";
import { ProjectCard } from "@/components/ProjectCard";
import { Button } from "@/components/ui/button";
import { Plus, Loader } from "lucide-react";
import { ProjectDialog } from "@/components/ProjectDialog";
import { getProjects, createProject, updateProject, deleteProject } from "@/shared/api/projects/projects";
import { toast } from "sonner";

interface ProjectCardData {
  id: string | number;
  name: string;
  description: string;
  keywordsCount?: number; 
  chatsCount?: number;   
  createdAt: string | Date;
  status?: string;
  isTracking?: boolean;  
  isSending?: boolean;   
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<ProjectCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        const apiProjects = await getProjects();
        
        const formattedProjects: ProjectCardData[] = apiProjects.map(project => ({
          id: project.id,
          name: project.name,
          description: project.description,
          keywordsCount: 0, 
          chatsCount: 0,    
          createdAt: project.created_at || new Date(),
          status: "Активен"
        }));
        
        setProjects(formattedProjects);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch projects:", err);
        setError("Failed to load projects. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchProjects();
  }, []);

  const handleCreateProject = async (data: { name: string; description: string }) => {
    try {
      setSubmitting(true);
      
      // Call the API to create the project
      const createdProject = await createProject(data);
      
      // Format the new project to match our UI format
      const newProject = {
        id: createdProject.id,
        name: createdProject.name,
        description: createdProject.description,
        keywordsCount: 0,
        chatsCount: 0,
        createdAt: createdProject.created_at || new Date(),
        status: "Активен"
      };
      
      // Add to the projects list
      setProjects([newProject, ...projects]);
      setCreateDialogOpen(false);
      
      // Show success toast
      toast.success(`Проект "${data.name}" успешно создан.`, {
        description: "Вы можете начать добавлять ключевые слова.",
      });
      
    } catch (error) {
      console.error("Failed to create project:", error);
      
      // Show error toast
      toast.error("Не удалось создать проект", {
        description: "Пожалуйста, попробуйте снова позже.",
        action: {
          label: "Повторить",
          onClick: () => setCreateDialogOpen(true)
        }
      });
      
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditProject = async (id: string | number, updatedData: { name: string; description: string }) => {
    try {
      // Call the API to update the project
      await updateProject(id, updatedData);
      
      // Update local state
      setProjects(projects.map(project => 
        project.id === id 
          ? { ...project, ...updatedData } 
          : project
      ));
      
      // Show success toast
      toast.success(`Проект успешно обновлен.`, {
        description: `Изменения для "${updatedData.name}" сохранены.`,
      });
      
    } catch (error) {
      console.error("Failed to update project:", error);
      
      // Show error toast
      toast.error("Не удалось обновить проект", {
        description: "Пожалуйста, попробуйте снова позже.",
      });
    }
  };

  const handleDeleteProject = async (id: string | number) => {
    try {
      // Find the project to get its name for the toast
      const projectToDelete = projects.find(p => p.id === id);
      
      // Call the API to delete the project
      await deleteProject(id);
      
      // Update local state
      setProjects(projects.filter(project => project.id !== id));
      
      // Show success toast
      toast.success(`Проект удален.`, {
        description: projectToDelete ? `Проект "${projectToDelete.name}" удален.` : undefined,
      });
      
    } catch (error) {
      console.error("Failed to delete project:", error);
      
      // Show error toast
      toast.error("Не удалось удалить проект", {
        description: "Пожалуйста, попробуйте снова позже.",
      });
    }
  };

  return (
    <div className="container max-w-screen-2xl">
      {loading ? (
        <div className="flex items-center justify-center" style={{ minHeight: "calc(100vh - 120px)" }}>
          <Loader className="h-10 w-10 animate-spin text-primary" />
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <p className="text-red-500">{error}</p>
          <Button onClick={() => window.location.reload()} className="mt-4">
            Попробовать снова
          </Button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {projects.map(project => (
              <ProjectCard
                key={project.id}
                project={project}
                onEdit={handleEditProject}
                onDelete={handleDeleteProject}
              />
            ))}
          </div>

          {projects.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">
                У вас пока нет проектов
              </p>
            </div>
          )}
        </>
      )}

      <Button 
        onClick={() => setCreateDialogOpen(true)}
        className="fixed bottom-[50px] right-[50px] rounded-full shadow-lg h-12 w-12 p-0 hover:cursor-pointer"
        size="icon"
      >
        <Plus className="h-6 w-6" />
        <span className="sr-only">Создать проект</span>
      </Button>

      <ProjectDialog
        mode="create"
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        projectData={{ name: "", description: "" }}
        trigger={null}
        onSubmit={handleCreateProject}
        isSubmitting={submitting}
      />
    </div>
  );
}
