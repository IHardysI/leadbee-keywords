import React, { useState } from "react";
import { formatDate } from "@/shared/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Edit, MoreHorizontal, MessageSquare, Tag, Trash2, Eye, Send } from "lucide-react";
import { ProjectDialog } from "@/components/ProjectDialog";

interface Project {
  id: string | number;
  name: string;
  description: string;
  keywordsCount: number;
  chatsCount: number;
  createdAt: string | Date;
  status?: string;
  isTracking?: boolean;  
  isSending?: boolean;   
}

interface ProjectCardProps {
  project: Project;
  onEdit: (id: string | number, updatedData: { name: string; description: string }) => void;
  onDelete: (id: string | number) => void;
}

export function ProjectCard({ project, onEdit, onDelete }: ProjectCardProps) {
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  const handleEdit = (id: string | number, updatedData: { name: string; description: string }) => {
    onEdit(id, updatedData);
  };

  const handleDelete = (id: string | number) => {
    onDelete(id);
  };

  return (
    <>
      <Card key={project.id} className="overflow-hidden flex flex-col h-full pb-0">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div>
              <CardTitle>{project.name}</CardTitle>
              <CardDescription className="mt-1 line-clamp-2">{project.description}</CardDescription>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreHorizontal className="h-4 w-4" />
                  <span className="sr-only">Открыть меню</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Действия</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setEditDialogOpen(true)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Редактировать
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleDelete(project.id)}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Удалить
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent className="flex-grow pb-0">
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-1 min-w-[120px]">
              <Tag className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
              <span className="text-sm">{project.keywordsCount} ключевых слов</span>
            </div>
            <div className="flex items-center gap-1 min-w-[80px]">
              <MessageSquare className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
              <span className="text-sm">{project.chatsCount} чатов</span>
            </div>
          </div>
        </CardContent>
        <CardFooter className="border-t bg-muted/50 px-6 py-3 mt-auto">
          <div className="flex flex-col w-full text-xs text-muted-foreground">
            <span>Создан {formatDate(project.createdAt)}</span>
            <div className="flex flex-wrap items-center gap-1 mt-2 min-h-[42px]">
              {project.isTracking && (
                <Badge variant="outline" className="flex items-center gap-1 bg-blue-500/10 text-xs py-0 h-5">
                  <Eye className="h-3 w-3" />
                  <span>Отслеживается</span>
                </Badge>
              )}
              {project.isSending && (
                <Badge variant="outline" className="flex items-center gap-1 bg-green-500/10 text-xs py-0 h-5">
                  <Send className="h-3 w-3" />
                  <span>Отправляется</span>
                </Badge>
              )}
              <Badge variant="outline" className="text-xs py-0 h-5">{project.status || "Активен"}</Badge>
            </div>
          </div>
        </CardFooter>
      </Card>
      
      <ProjectDialog
        mode="edit"
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        projectData={{
          name: project.name,
          description: project.description
        }}
        trigger={null}
        onSubmit={(data) => handleEdit(project.id, data)}
      />
    </>
  );
} 