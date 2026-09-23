'use client';

import { Container, Text, Stack, Paper, Button } from '@mantine/core';
import { LucideIcon } from 'lucide-react';

export interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ icon: Icon, title, description, actionLabel, onAction }: EmptyStateProps) {
  return (
    <Container size="sm" py="xl">
      <Paper shadow="sm" p="xl" radius="md" withBorder ta="center">
        <Stack align="center" gap="md">
          {Icon && (
            <div style={{ opacity: 0.4 }}>
              <Icon size={48} strokeWidth={1} />
            </div>
          )}
          <Text size="lg" fw={500}>
            {title}
          </Text>
          {description && (
            <Text c="dimmed" size="sm">
              {description}
            </Text>
          )}
          {actionLabel && onAction && (
            <Button onClick={onAction} mt="md" size="sm">
              {actionLabel}
            </Button>
          )}
        </Stack>
      </Paper>
    </Container>
  );
}
