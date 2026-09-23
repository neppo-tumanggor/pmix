'use client';

import { Avatar, Button, Group, Text, Menu, UnstyledButton } from '@mantine/core';
import { User, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useAuthStore } from '@/stores';
import { authApi } from '@/lib/api/auth';
import { notifications } from '@mantine/notifications';

export default function UserMenu() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  
  if (!user) return null;

  const initials = user.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const handleLogout = async () => {
    try {
      const refreshToken = useAuthStore.getState().refreshToken;
      if (refreshToken) {
        await authApi.logout(refreshToken);
      }
    } catch (error) {
      console.error('Logout error:', error);
      notifications.show({
        title: 'Logout',
        message: 'Logged out locally. Server logout failed.',
        color: 'orange',
      });
    } finally {
      logout();
      router.push('/login');
    }
  };

  return (
    <Menu shadow="md" width={200} position="top-end">
      <Menu.Target>
        <UnstyledButton
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '8px 12px',
            width: '100%',
            borderRadius: '6px',
            transition: 'background-color 150ms ease-out',
          }}
        >
          <Avatar size="sm" radius="xl" color="blue">
            {initials}
          </Avatar>
          {user && (
            <div style={{ flex: 1, minWidth: 0 }}>
              <Text size="sm" fw={500} truncate>
                {user.name}
              </Text>
              <Text size="xs" c="dimmed" truncate>
                {user.email}
              </Text>
            </div>
          )}
        </UnstyledButton>
      </Menu.Target>

      <Menu.Dropdown>
        <Menu.Item
          leftSection={<User size={16} />}
          onClick={() => router.push('/profile')}
        >
          Profile
        </Menu.Item>
        <Menu.Divider />
        <Menu.Item
          color="red"
          leftSection={<LogOut size={16} />}
          onClick={handleLogout}
        >
          Logout
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
}
