"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader } from "lucide-react";

export interface ProjectFormData {
  name: string;
  description: string;
}

interface ProjectDialogProps {
  mode: 'create' | 'edit';
  projectData?: ProjectFormData;
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSubmit: (data: ProjectFormData) => void;
  isSubmitting?: boolean;
}

export function ProjectDialog({
  mode,
  projectData,
  trigger,
  open,
  onOpenChange,
  onSubmit,
  isSubmitting = false
}: ProjectDialogProps) {
  const [name, setName] = useState(projectData?.name || "");
  const [description, setDescription] = useState(projectData?.description || "");

  // Update form when projectData changes (for edit mode)
  useEffect(() => {
    if (projectData) {
      setName(projectData.name || "");
      setDescription(projectData.description || "");
    }
  }, [projectData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ name, description });
    
    if (onOpenChange) {
      onOpenChange(false);
    }
    
    if (mode === 'create') {
      setName("");
      setDescription("");
    }
  };

  const title = mode === 'create' ? 'Создать проект' : 'Редактировать проект';
  const submitText = mode === 'create' ? 'Создать' : 'Сохранить';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="project-dialog-content rounded-lg p-4">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {mode === 'create' 
              ? 'Создайте новый проект для отслеживания ключевых слов' 
              : 'Внесите изменения в существующий проект'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-3">
            <div className="space-y-2">
              <Label htmlFor="name">
                Название
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">
                Описание
              </Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader className="mr-2 h-4 w-4 animate-spin" />
                  {mode === 'create' ? 'Создание...' : 'Сохранение...'}
                </>
              ) : (
                submitText
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 