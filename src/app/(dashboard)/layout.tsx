"use client";

import React, { useState } from "react";
import Sidebar from "@/components/Sidebar"; // Adjust this import according to your actual file structure
import ThemeToggle from "@/components/ThemeToggle"; // Adjust this import according to your actual file structure
import { useUser, useClerk } from "@clerk/nextjs";
import { UserIcon } from "@/components/Avatar";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { isLoaded, user } = useUser();
  const { signOut } = useClerk();

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-40 w-[240px] transition-transform duration-300 transform ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:relative md:translate-x-0`}
      >
        <Sidebar onClose={() => setSidebarOpen(false)} />
      </div>

      {/* Overlay для мобильных */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-30 md:hidden"
        />
      )}

      {/* Основной контент */}
      <div className="flex flex-1 flex-col">
        {/* Верхняя навигационная панель */}
        <header className="sticky top-0 z-10 border-b bg-background px-4 py-3 flex items-center justify-between">
          <div className="flex items-center">
            {/* Кнопка мобильного меню */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 mr-2 text-gray-700 focus:outline-none md:hidden"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>

          {/* User controls */}
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <UserIcon
              userName={
                isLoaded && user?.username
                  ? user.username
                  : isLoaded && (user?.firstName || user?.lastName)
                    ? `${user?.firstName || ""} ${user?.lastName || ""}`.trim()
                    : isLoaded && user?.primaryEmailAddress?.emailAddress
                      ? user?.primaryEmailAddress?.emailAddress
                      : undefined
              }
              userEmail={
                isLoaded && (user?.username || user?.firstName || user?.lastName)
                  ? user?.primaryEmailAddress?.emailAddress
                  : undefined
              }
              onSignOut={() => signOut()}
              imageUrl={isLoaded && user?.imageUrl ? user.imageUrl : undefined}
            />
          </div>
        </header>

        {/* Содержимое страницы - всегда отображается */}
        <div className="flex-1 p-6 overflow-auto">{children}</div>
      </div>
    </div>
  );
}
