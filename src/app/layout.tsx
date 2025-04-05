"use client";

import { useState } from "react";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import ThemeToggle from "@/components/ThemeToggle";
import { Toaster } from "sonner";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  return (
    <html lang="ru" className="dark" suppressHydrationWarning={true}>
      <body className="antialiased">
        <div className="flex h-screen">
          {/* Sidebar */}
          <div
            className={`fixed inset-y-0 left-0 z-40 w-[240px] transition-transform duration-300 transform ${
              sidebarOpen ? "translate-x-0" : "-translate-x-full"
            } md:relative md:translate-x-0`}
          >
            <Sidebar onClose={() => setSidebarOpen(false)} />
          </div>
          
          {/* Overlay для мобильных: клик вне сайдбара закроет его */}
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
              
              {/* Переключатель темы */}
              <ThemeToggle />
            </header>
            
            {/* Содержимое страницы */}
            <main className="flex-1 p-6 overflow-auto">{children}</main>
          </div>
        </div>
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
