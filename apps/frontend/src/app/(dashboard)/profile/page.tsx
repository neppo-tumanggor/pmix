'use client';

import { Container, Title, Text, Stack, Badge, Group, Button, Avatar, Paper, Divider } from '@mantine/core';
import { ArrowLeft, Mail, Shield, Calendar, User } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores';
import { PageHeader } from '@/components/layout/page-header';

export default function ProfilePage() {
  const router = useRouter();
  const { user } = useAuthStore();

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

  const initials = user.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <Container size="sm" py="lg">
      <Stack gap="lg">
        <PageHeader
          title="Profile"
          description="View and manage your account information"
          action={
            <Button
              variant="outline"
              leftSection={<ArrowLeft size={16} />}
              onClick={() => router.back()}
            >
              Back
            </Button>
          }
        />

        <Paper shadow="sm" p="lg" radius="md" withBorder>
          <Stack gap="md">
            <Group gap="md">
              <Avatar size="xl" radius="xl" color="blue">
                {initials}
              </Avatar>
              <div>
                <Title order={2} size="h3">
                  {user.name}
                </Title>
                <Text c="dimmed" size="sm">
                  {user.email}
                </Text>
              </div>
            </Group>
          </Stack>
        </Paper>

        <Paper shadow="sm" p="lg" radius="md" withBorder>
          <Stack gap="md">
            <Group gap="sm">
              <Mail size={18} color="gray" />
              <div style={{ flex: 1 }}>
                <Text size="xs" c="dimmed">
                  Email
                </Text>
                <Text size="sm">{user.email}</Text>
              </div>
            </Group>

            <Divider my="xs" />

            <Group gap="sm">
              <Shield size={18} color="gray" />
              <div style={{ flex: 1 }}>
                <Text size="xs" c="dimmed">
                  Role
                </Text>
                <Text size="sm" tt="capitalize">
                  {user.role}
                </Text>
              </div>
            </Group>

            <Divider my="xs" />

            <Group gap="sm">
              <User size={18} color="gray" />
              <div style={{ flex: 1 }}>
                <Text size="xs" c="dimmed">
                  Status
                </Text>
                <Badge color={user.emailVerified ? 'green' : 'red'} variant="light" size="sm">
                  {user.emailVerified ? 'Verified' : 'Unverified'}
                </Badge>
              </div>
            </Group>

            {user.lastLogin && (
              <>
                <Divider my="xs" />
                <Group gap="sm">
                  <Calendar size={18} color="gray" />
                  <div style={{ flex: 1 }}>
                    <Text size="xs" c="dimmed">
                      Last Login
                    </Text>
                    <Text size="sm">{formatDate(user.lastLogin)}</Text>
                  </div>
                </Group>
              </>
            )}
          </Stack>
        </Paper>
      </Stack>
    </Container>
  );
}
