"use client";

import React from "react";
import { ProjectCard } from "@/components/ProjectCard";
import { CreateProject } from "@/components/CreateProject";
// Моковые данные проектов
const mockProjects = [
  {
    id: 1,
    name: "Мониторинг форумов",
    description: "Отслеживание ключевых слов на популярных форумах",
    keywordsCount: 24,
    chatsCount: 8,
    createdAt: "2023-11-15T10:00:00",
    status: "Активен",
    isTracking: true,
    isSending: false
  },
  {
    id: 2,
    name: "Анализ конкурентов",
    description: "Мониторинг упоминаний компаний-конкурентов в социальных сетях",
    keywordsCount: 36,
    chatsCount: 12,
    createdAt: "2023-12-05T15:30:00",
    status: "Активен",
    isTracking: true,
    isSending: true
  },
  {
    id: 3,
    name: "Репутация бренда",
    description: "Отслеживание упоминаний бренда в телеграм-каналах",
    keywordsCount: 18,
    chatsCount: 15,
    createdAt: "2024-01-22T09:15:00",
    status: "Активен",
    isTracking: false,
    isSending: true
  },
  {
    id: 4,
    name: "Запросы о продукте",
    description: "Поиск вопросов пользователей о нашем продукте",
    keywordsCount: 12,
    chatsCount: 6,
    createdAt: "2024-02-10T11:45:00",
    status: "Приостановлен",
    isTracking: false,
    isSending: false
  }
];

export default function ProjectsPage() {
  // Обработчики событий
  const handleEditProject = (id: string | number, updatedData: { name: string; description: string }) => {
    console.log(`Редактирование проекта с ID: ${id}`, updatedData);
    // Здесь будет логика обновления проекта
  };

  const handleDeleteProject = (id: string | number) => {
    console.log(`Удаление проекта с ID: ${id}`);
  };

  const handleCreateProject = (project: { name: string; description: string }) => {
    console.log("Создание нового проекта:", project);
    // Здесь будет логика добавления нового проекта в список
  };

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {mockProjects.map(project => (
          <ProjectCard
            key={project.id}
            project={project}
            onEdit={handleEditProject}
            onDelete={handleDeleteProject}
          />
        ))}
      </div>
      <div className="fixed bottom-[50px] right-[50px]">
        <CreateProject onCreateProject={handleCreateProject} />
      </div>
    </div>
  );
}
