'use client';

import { Container, Title, Text, Stack, Paper, Button, TextInput, PasswordInput, Badge, Alert, Group } from '@mantine/core';

export default function DesignSystemPage() {
  return (
    <Container size="lg" py="lg">
      <Stack gap="lg">
        <div>
          <Title order={1} size="h1">
            Design System
          </Title>
          <Text c="dimmed" size="lg" mt="xs">
            Swiss Design Standard - Component Showcase
          </Text>
        </div>

        {/* Buttons */}
        <Paper shadow="sm" p="lg" radius="md" withBorder>
          <Title order={3} size="h4" mb="md">Buttons</Title>
          <Group gap="sm">
            <Button variant="filled">Primary</Button>
            <Button variant="filled" color="red">Destructive</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="light">Secondary</Button>
            <Button variant="subtle">Ghost</Button>
          </Group>
        </Paper>

        {/* Inputs */}
        <Paper shadow="sm" p="lg" radius="md" withBorder>
          <Title order={3} size="h4" mb="md">Form Inputs</Title>
          <Stack gap="md" style={{ maxWidth: 400 }}>
            <TextInput label="Email" type="email" placeholder="admin@pmix.com" />
            <PasswordInput label="Password" placeholder="password" />
            <TextInput label="Error State" error="This field is required" />
          </Stack>
        </Paper>

        {/* Badges */}
        <Paper shadow="sm" p="lg" radius="md" withBorder>
          <Title order={3} size="h4" mb="md">Badges</Title>
          <Group gap="sm">
            <Badge variant="filled">Default</Badge>
            <Badge variant="filled" color="green">Success</Badge>
            <Badge variant="filled" color="yellow">Warning</Badge>
            <Badge variant="filled" color="red">Error</Badge>
            <Badge variant="filled" color="blue">Info</Badge>
          </Group>
        </Paper>

        {/* Alerts */}
        <Paper shadow="sm" p="lg" radius="md" withBorder>
          <Title order={3} size="h4" mb="md">Alerts</Title>
          <Stack gap="md">
            <Alert color="blue" title="Info">
              This is an informational alert.
            </Alert>
            <Alert color="green" title="Success">
              Operation completed successfully!
            </Alert>
            <Alert color="yellow" title="Warning">
              Please review before proceeding.
            </Alert>
            <Alert color="red" title="Error">
              Something went wrong.
            </Alert>
          </Stack>
        </Paper>
      </Stack>
    </Container>
  );
}
