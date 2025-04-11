import { clerkClient } from '@clerk/nextjs/server';

import type { ReactNode } from 'react';

import UsersTableClient from './UsersTableClient';

type User = {
  id: string;
  username: string;
  email: string;
};

export default async function UsersTablePage() {
  // Fetch users on the server
  const client = await clerkClient();
  const clerkUsers = (await client.users.getUserList()).data;
  const users: User[] = clerkUsers.map((u: any) => ({
    id: u.id,
    username: u.username || '',
    email: u.emailAddresses?.[0]?.emailAddress || ''
  }));

  const currentUserId = 'CURRENT_USER_ID';
  const isCurrentUserAdmin = true;

  return (
    <UsersTableClient
      users={users}
      currentUserId={currentUserId}
      isCurrentUserAdmin={isCurrentUserAdmin}
    />
  );
}
