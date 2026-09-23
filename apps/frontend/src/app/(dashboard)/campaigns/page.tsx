'use client';

import { Container, Title, Text, SimpleGrid, Paper, Stack, Group } from '@mantine/core';
import { Megaphone, TrendingUp, Users, Calendar } from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';

export default function CampaignsPage() {
  const stats = [
    { title: 'Active Campaigns', value: '12', icon: Megaphone, color: 'orange' },
    { title: 'Total Reach', value: '45.2K', icon: Users, color: 'blue' },
    { title: 'Conversion', value: '3.2%', icon: TrendingUp, color: 'green' },
    { title: 'Scheduled', value: '5', icon: Calendar, color: 'teal' },
  ];

  return (
    <Container size="lg" py="lg">
      <Stack gap="lg">
        <PageHeader
          title="Campaigns"
          description="Manage your marketing campaigns and promotions"
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
              Campaign List
            </Title>
            <Text c="dimmed" size="sm">
              Campaign management features coming soon.
            </Text>
          </Stack>
        </Paper>
      </Stack>
    </Container>
  );
}
