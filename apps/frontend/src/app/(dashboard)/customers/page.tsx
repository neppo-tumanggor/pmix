'use client';

import { Container, Title, Text, SimpleGrid, Paper, Stack, Group } from '@mantine/core';
import { Users, UserPlus, Mail, TrendingUp } from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';

export default function CustomersPage() {
  const stats = [
    { title: 'Total Customers', value: '1,234', icon: Users, color: 'blue' },
    { title: 'New This Month', value: '89', icon: UserPlus, color: 'green' },
    { title: 'Email Subscribers', value: '456', icon: Mail, color: 'orange' },
    { title: 'Growth Rate', value: '+12%', icon: TrendingUp, color: 'teal' },
  ];

  return (
    <Container size="lg" py="lg">
      <Stack gap="lg">
        <PageHeader
          title="Customers"
          description="Manage your customer relationships and data"
        />

        <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing="md">
          {stats.map((stat) => (
            <Paper key={stat.title} shadow="sm" p="lg" radius="md" withBorder>
              <Group justify="space-between" align="flex-start">
                <div>
                  <Text c="dimmed" size="sm" mb="xs">
                    {stat.title}
                  </Text>
                  <Text fw={700} size="xl">
                    {stat.value}
                  </Text>
                </div>
                <stat.icon size={24} color={`var(--color-${stat.color}-600)`} />
              </Group>
            </Paper>
          ))}
        </SimpleGrid>

        <Paper shadow="sm" p="lg" radius="md" withBorder>
          <Stack gap="md">
            <Title order={3} size="h4">
              Customer List
            </Title>
            <Text c="dimmed" size="sm">
              Customer management features coming soon.
            </Text>
          </Stack>
        </Paper>
      </Stack>
    </Container>
  );
}
