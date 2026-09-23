'use client';

import { useState, useEffect } from 'react';
import { Container, Title, Text, Stack, Paper, TextInput, Select, Checkbox, Button, Group, Alert } from '@mantine/core';
import { PageHeader } from '@/components/layout/page-header';

type Settings = {
  storeName: string;
  email: string;
  currency: string;
  notifyEmail: boolean;
  notifyProduct: boolean;
};

const defaultSettings: Settings = {
  storeName: "pmix Store",
  email: "admin@example.com",
  currency: "IDR",
  notifyEmail: true,
  notifyProduct: false,
};

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("pmix-settings");
    if (stored) {
      try {
        setSettings(JSON.parse(stored));
      } catch {
        setSettings(defaultSettings);
      }
    }
  }, []);

  const handleSave = () => {
    localStorage.setItem("marketing-settings", JSON.stringify(settings));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const update = (patch: Partial<Settings>) =>
    setSettings((prev: Settings) => ({ ...prev, ...patch }));

  return (
    <Container size="md" py="lg">
      <Stack gap="lg">
        <PageHeader
          title="Settings"
          description="Manage general application settings"
        />

        <Paper shadow="sm" p="lg" radius="md" withBorder>
          <Stack gap="md">
            <div>
              <Title order={3} size="h4">General</Title>
              <Text c="dimmed" size="sm" mt="xs">
                Basic store information used across the dashboard.
              </Text>
            </div>

            <Stack gap="md">
              <TextInput
                label="Store name"
                value={settings.storeName}
                onChange={(e) => update({ storeName: e.currentTarget.value })}
              />

              <TextInput
                label="Contact email"
                type="email"
                value={settings.email}
                onChange={(e) => update({ email: e.currentTarget.value })}
              />

              <Select
                label="Currency"
                value={settings.currency}
                onChange={(value) => update({ currency: value || 'IDR' })}
                data={[
                  { value: 'IDR', label: 'IDR' },
                  { value: 'USD', label: 'USD' },
                  { value: 'EUR', label: 'EUR' },
                ]}
              />
            </Stack>
          </Stack>
        </Paper>

        <Paper shadow="sm" p="lg" radius="md" withBorder>
          <Stack gap="md">
            <div>
              <Title order={3} size="h4">Notifications</Title>
              <Text c="dimmed" size="sm" mt="xs">
                Choose what notifications you want to receive.
              </Text>
            </div>

            <Stack gap="sm">
              <Checkbox
                label="Email notifications"
                checked={settings.notifyEmail}
                onChange={(e) => update({ notifyEmail: e.currentTarget.checked })}
              />
              <Checkbox
                label="Product update alerts"
                checked={settings.notifyProduct}
                onChange={(e) => update({ notifyProduct: e.currentTarget.checked })}
              />
            </Stack>
          </Stack>
        </Paper>

        <Paper shadow="sm" p="lg" radius="md" withBorder>
          <Group justify="space-between">
            <Text size="sm" c="dimmed">Settings are saved locally for now.</Text>
            <Group gap="sm">
              {saved && (
                <Alert color="green" variant="light" py="xs">Saved</Alert>
              )}
              <Button onClick={handleSave}>Save settings</Button>
            </Group>
          </Group>
        </Paper>
      </Stack>
    </Container>
  );
}
