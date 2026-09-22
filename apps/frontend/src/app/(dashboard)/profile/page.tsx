'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Container, Title, Text, Stack, Badge, Divider, Skeleton, Group, Button } from '@mantine/core';
import { ArrowLeft, Mail, Shield, Calendar, User } from 'lucide-react';
import { useAuthStore } from '@/stores';
import { authApi } from '@/lib/api/auth';
import ProtectedRoute from '@/components/auth/protected-route';

type Settings = {
  storeName: string;
  email: string;
  currency: string;
  notifyEmail: boolean;
  notifyProduct: boolean;
};

const defaultSettings: Settings = {
  storeName: 'pmix Store',
  email: 'admin@example.com',
  currency: 'IDR',
  notifyEmail: true,
  notifyProduct: false,
};

export default function ProfilePage() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const loadProfile = async () => {
      try {
        const fresh = await authApi.getCurrentUser();
        if (!cancelled) {
          // store update is not available, but we keep this for future extensibility
          console.log('fresh profile', fresh);
        }
      } catch (e) {
        console.error('Failed to load profile', e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadProfile();

    return () => {
      cancelled = true;
    };
  }, []);

  const formatDate = (date?: Date) => {
    if (!date) return 'Never';
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(date));
  };

  if (!user) return null;

  return (
    <Container size="sm" className="py-8">
      <Group justify="space-between" className="mb-6">
        <Button variant="subtle" onClick={() => router.back()} className="cursor-pointer">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </Button>
      </Group>

      <Stack gap="md">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
            <span className="text-2xl font-semibold text-gray-700">
              {user.name
                .split(' ')
                .map((n) => n[0])
                .join('')
                .slice(0, 2)
                .toUpperCase()}
            </span>
          </div>
          <div>
            <Title order={2} className="text-xl font-semibold text-foreground">
              {user.name}
            </Title>
            <Text size="sm" className="text-gray-500">
              {user.email}
            </Text>
          </div>
        </div>

        <Divider />

        <Stack gap="sm">
          <div className="flex items-start gap-3">
            <Mail className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
            <div>
              <Text size="xs" className="text-gray-500">
                Email
              </Text>
              <Text size="sm" className="text-foreground">
                {user.email}
              </Text>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Shield className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
            <div>
              <Text size="xs" className="text-gray-500">
                Role
              </Text>
              <Text size="sm" className="text-foreground capitalize">
                {user.role}
              </Text>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <User className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
            <div>
              <Text size="xs" className="text-gray-500">
                Status
              </Text>
              <Badge color={user.emailVerified ? 'green' : 'red'} variant="light" size="sm">
                {user.emailVerified ? 'Verified' : 'Unverified'}
              </Badge>
            </div>
          </div>

          {user.lastLogin && (
            <div className="flex items-start gap-3">
              <Calendar className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
              <div>
                <Text size="xs" className="text-gray-500">
                  Last Login
                </Text>
                <Text size="sm" className="text-foreground">
                  {formatDate(user.lastLogin)}
                </Text>
              </div>
            </div>
          )}
        </Stack>
      </Stack>
    </Container>
  );
}
