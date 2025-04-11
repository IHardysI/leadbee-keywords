'use client';

import { useState } from 'react';
import { UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogTrigger, DialogContent, DialogTitle } from '@/components/ui/dialog';
import AddUserDialog from '@/components/AddUserDialog';
import { VisuallyHidden } from '@/components/ui/visuallyHidden';
import UserTable, { User } from '@/components/UserTable';

interface UsersTableClientProps {
  users: User[];
  currentUserId: string;
  isCurrentUserAdmin: boolean;
}

export default function UsersTableClient({ users, currentUserId }: UsersTableClientProps) {
  const [openAddDialog, setOpenAddDialog] = useState<boolean>(false);
  const [userList, setUserList] = useState<User[]>(users);

  const deleteUser = async (id: string) => {
    try {
      const response = await fetch('/api/delete-user', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: id })
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  };

  const handleDeleteUser = async (id: string) => {
    try {
      const data = await deleteUser(id);
      console.log('Successfully deleted user with id', id);
      setUserList(prev => prev.filter(user => user.id !== id));
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-md border overflow-hidden">
        <div className="bg-muted px-4 py-3 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-foreground">Пользователи</h2>
          <Dialog open={openAddDialog} onOpenChange={setOpenAddDialog}>
            <DialogTrigger asChild>
              <Button 
                variant="default" 
                className="rounded-full w-10 h-10" 
                size="icon"
              >
                <UserPlus className="h-5 w-5" />
                <span className="sr-only">Добавить нового пользователя</span>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogTitle>
                <VisuallyHidden>Добавить пользователя</VisuallyHidden>
              </DialogTitle>
              <AddUserDialog
                onAddUser={(newUser: User) => { setUserList(prev => [...prev, newUser]); setOpenAddDialog(false); }}
                onClose={() => setOpenAddDialog(false)}
              />
            </DialogContent>
          </Dialog>
        </div>
        <UserTable
          users={userList}
          onDeleteUser={handleDeleteUser}
          currentUserId={currentUserId}
        />
      </div>
    </div>
  );
} 