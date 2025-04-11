'use client';

import { Pencil, Trash2, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Dialog, DialogTrigger, DialogContent, DialogTitle } from "@/components/ui/dialog";
import EditUserDialog from "../EditUserDialog";
import { useState } from "react";
import { VisuallyHidden } from "@/components/ui/visuallyHidden";

export type User = {
  id: string;
  username: string;
  email: string;
};

type UserTableProps = {
  users: User[];
  onDeleteUser: (id: string) => void;
  currentUserId: string;
  editingEnabled?: boolean;
};

export default function UserTable({
  users,
  onDeleteUser,
  currentUserId,
  editingEnabled = false
}: UserTableProps) {
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);

  const handleDeleteUser = async (id: string) => {
    try {
      setDeletingUserId(id);
      await onDeleteUser(id);
    } catch (error) {
      console.error("Error deleting user:", error);
      // You could add a toast notification here to show the error to the user
    } finally {
      setDeletingUserId(null);
    }
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Имя пользователя</TableHead>
          <TableHead>Email</TableHead>
          <TableHead className="w-[150px]">Действия</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((user) => (
          <TableRow key={user.id}>
            <TableCell className="font-medium ">
              {user.username}
            </TableCell>
            <TableCell>{user.email}</TableCell>
            <TableCell>
              <div className="flex gap-2">
                <Dialog open={openEditDialog && editingUser?.id === user.id} onOpenChange={(open) => {
                  if (!open) setEditingUser(null);
                  setOpenEditDialog(open);
                }}>
                  <DialogTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setEditingUser(user)}
                      disabled={!editingEnabled}
                    >
                      <Pencil className="h-4 w-4" />
                      <span className="sr-only">Редактировать пользователя</span>
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogTitle>
                      <VisuallyHidden>Редактировать пользователя</VisuallyHidden>
                    </DialogTitle>
                    {editingUser && (
                      <EditUserDialog
                        user={editingUser}
                        onEdit={async (updatedUser) => {
                          // Implement actual edit functionality here
                          console.log("Updating user:", updatedUser);
                          // You would typically make an API call here
                          
                          // Close the dialog when done
                          setOpenEditDialog(false);
                        }}
                        onClose={() => setOpenEditDialog(false)}
                        currentUserId={currentUserId}
                      />
                    )}
                  </DialogContent>
                </Dialog>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-red-500 hover:text-red-700"
                  onClick={() => handleDeleteUser(user.id)}
                  disabled={deletingUserId === user.id}
                >
                  <Trash2 className="h-4 w-4" />
                  <span className="sr-only">Удалить</span>
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
