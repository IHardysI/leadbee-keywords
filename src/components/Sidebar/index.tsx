"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/shared/lib/utils";
import {
  FolderKanban,
  X,
  Users,
} from "lucide-react";

export const routes = [
  {
    label: "Проекты",
    icon: FolderKanban,
    href: "/projects",
    color: "text-violet-500",
  },
  {
    label: "Чаты",
    icon: Users,
    href: "/chats",
    color: "text-orange-500",
  },
  {
    label: "Пользователи",
    icon: Users,
    href: "/users",
    color: "text-blue-500",
  },
];

interface SidebarProps {
  onClose: () => void;
}

export default function Sidebar({ onClose }: SidebarProps) {
  const pathname = usePathname();

  return (
    <div className="flex h-full w-[240px] flex-col space-y-4 border-r dark:bg-black bg-white dark:text-white text-black py-4">
      <div className="flex items-center justify-between px-3 py-2">
        <h2 className="mb-2 text-lg font-semibold tracking-tight">
          Панель по 🔑 словам
        </h2>
        <button onClick={onClose} className="p-2 focus:outline-none md:hidden">
          <X className="h-5 w-5" />
        </button>
      </div>
      <div className="px-3">
        <div className="space-y-1">
          {routes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              onClick={onClose}
              className={cn(
                "flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:bg-gray-200 dark:hover:bg-gray-800",
                pathname === route.href
                  ? "dark:bg-gray-800 bg-gray-200 dark:text-white text-black"
                  : "transparent"
              )}
            >
              <route.icon className={cn("mr-2 h-4 w-4", route.color)} />
              {route.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
} 