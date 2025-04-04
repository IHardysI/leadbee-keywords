import React from "react"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

export function AddCircleButton({ onClick }: { onClick?: () => void }) {
  return (
    <Button
      onClick={onClick}
      className="bg-white text-black rounded-full w-10 h-10 flex items-center justify-center p-0 hover:cursor-pointer"
    >
      <Plus size={20} />
    </Button>
  )
}
