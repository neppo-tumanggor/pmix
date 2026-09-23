'use client';

import { Title, Text, Group, Stack } from '@mantine/core';
import { ReactNode } from 'react';

export interface PageHeaderProps {
  title: string;
  description?: string;
  action?: ReactNode;
  breadcrumb?: ReactNode;
}

export function PageHeader({ title, description, action, breadcrumb }: PageHeaderProps) {
  return (
    <Stack gap="xs">
        {breadcrumb && <div>{breadcrumb}</div>}
        <Group justify="space-between" align="flex-end" wrap="wrap">
          <div>
            <Title order={1} size="h2">
              {title}
            </Title>
            {description && (
              <Text c="dimmed" size="sm" mt="xs">
                {description}
              </Text>
            )}
          </div>
          {action && <div>{action}</div>}
        </Group>
    </Stack>
  );
}
