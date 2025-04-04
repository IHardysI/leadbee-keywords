"use client"

import { AddCircleButton } from "@/components/AddCircleButton"
import { ProjectDialog } from "@/components/ProjectDialog"

interface CreateProjectProps {
  onCreateProject?: (project: { name: string; description: string }) => void;
}

export function CreateProject({ onCreateProject }: CreateProjectProps) {
  return (
    <ProjectDialog
      mode="create"
      trigger={<AddCircleButton />}
      onSubmit={(data) => {
        if (onCreateProject) {
          onCreateProject(data)
        }
      }}
    />
  )
} 