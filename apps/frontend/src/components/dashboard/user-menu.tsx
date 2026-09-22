'use client';

import { useRouter } from 'next/navigation';
import { Avatar, Button, Group, Text } from '@mantine/core';
import { User, LogOut } from 'lucide-react';
import { useState } from 'react';
import { useAuthStore } from '@/stores';
import { authApi } from '@/lib/api/auth';
import { notifications } from '@mantine/notifications';

export default function UserMenu() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [opened, setOpened] = useState(false);

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
    <div className="relative">
      <button
        type="button"
        className="flex items-center gap-3 px-3 py-2 w-full hover:bg-sidebar-hover rounded-md transition-colors text-left"
        onClick={() => setOpened((v) => !v)}
        aria-expanded={opened}
      >
        <Avatar size="sm" radius="xl" className="bg-gray-200 text-gray-700 flex-shrink-0">
          {initials}
        </Avatar>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground truncate">{user.name}</p>
          <p className="text-xs text-gray-500 truncate">{user.email}</p>
        </div>
      </button>

      {opened && (
        <div
          className="absolute right-4 bottom-full mb-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-50"
          style={{ minWidth: 180 }}
        >
          <button
            type="button"
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-gray-50 transition-colors"
            onClick={() => {
              setOpened(false);
              router.push('/profile');
            }}
          >
            <User size={16} className="text-gray-500" />
            <span>Profile</span>
          </button>
          <div className="border-t border-gray-100" />
          <button
            type="button"
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
            onClick={() => {
              setOpened(false);
              handleLogout();
            }}
          >
            <LogOut size={16} />
            <span>Logout</span>
          </button>
        </div>
      )}
    </div>
  );
}
