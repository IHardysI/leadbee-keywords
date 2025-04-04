"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

interface ProjectFormData {
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
}

export function ProjectDialog({ 
  mode, 
  projectData, 
  trigger, 
  open: externalOpen, 
  onOpenChange: externalOnOpenChange, 
  onSubmit 
}: ProjectDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")

  // Initialize form with project data when editing
  useEffect(() => {
    if (mode === 'edit' && projectData) {
      setName(projectData.name)
      setDescription(projectData.description)
    }
  }, [mode, projectData, internalOpen])

  // Определяем, какие состояния и обработчики использовать
  const open = externalOpen !== undefined ? externalOpen : internalOpen
  const onOpenChange = externalOnOpenChange || setInternalOpen

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    onSubmit({ name, description })
    
    setInternalOpen(false)
    
    // Only reset form for create mode, not edit mode
    if (mode === 'create') {
      setName("")
      setDescription("")
    }
  }

  const isEditMode = mode === 'edit'
  const title = isEditMode ? "Редактирование проекта" : "Создание проекта"
  const buttonText = isEditMode ? "Сохранить изменения" : "Создать проект"
  const dialogDescription = isEditMode 
    ? "Измените информацию о проекте" 
    : "Создайте новый проект для отслеживания ключевых слов в чатах."

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>
              {dialogDescription}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Название</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Название проекта"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Описание</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Описание проекта"
                className="resize-none"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" className="hover:cursor-pointer">{buttonText}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
} 