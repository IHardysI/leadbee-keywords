"use client"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { LogOut, Settings, User } from "lucide-react"
import Link from "next/link"

interface UserProfileProps {
  userName?: string
  userEmail?: string
  onSignOut?: () => void
  imageUrl?: string
}

export function UserIcon({
  userName = "User",
  userEmail,
  onSignOut = () => console.log("Выход из системы"),
  imageUrl,
}: UserProfileProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Avatar className="h-10 w-10 cursor-pointer border-2 border-primary/10 bg-background transition-all hover:border-primary/30 hover:shadow-md hover:shadow-primary/20">
          {imageUrl ? (
            <img src={imageUrl} alt="User" />
          ) : (
            <AvatarFallback className="bg-primary/10 text-primary">
              <User className="h-5 w-5" />
            </AvatarFallback>
          )}
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-64 rounded-xl border border-border/30 bg-background/95 p-2 shadow-lg backdrop-blur-sm"
      >
        <DropdownMenuLabel className="rounded-lg p-4">
          <div className="flex flex-col space-y-1">
            <p className="text-base font-medium leading-none text-foreground">{userName}</p>
            {userEmail && (
              <p className="text-xs leading-relaxed text-muted-foreground">{userEmail}</p>
            )}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="my-1 opacity-30" />
        <DropdownMenuItem
          asChild
          className="flex cursor-pointer items-center gap-2 rounded-lg p-3 text-sm focus:bg-primary/10"
        >
          <Link href="/user-profile" className="flex items-center gap-2 w-full">
            <Settings className="h-4 w-4 text-muted-foreground" />
            <span>Профиль пользователя</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={onSignOut}
          className="flex cursor-pointer items-center gap-2 rounded-lg p-3 text-sm text-destructive focus:bg-destructive/10 focus:text-destructive"
        >
          <LogOut className="h-4 w-4" />
          <span>Выйти</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
