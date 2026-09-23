'use client';

import { NavLink, Group, Text, ActionIcon, Stack, Divider, Box } from '@mantine/core';
import { usePathname } from 'next/navigation';
import { Home, Box as BoxIcon, User, Rocket, Settings, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { useUIStore } from '@/stores';
import UserMenu from './user-menu';

const menuItems = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Products', href: '/products', icon: BoxIcon },
  { name: 'Customers', href: '/customers', icon: User },
  { name: 'Campaigns', href: '/campaigns', icon: Rocket },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const sidebarOpen = useUIStore((state) => state.sidebarOpen);
  const toggleSidebar = useUIStore((state) => state.toggleSidebar);
  return (
    <Stack gap="xs" h="100%" justify="space-between" bg="var(--sidebar-bg)">
      {/* Top Section: Logo + Navigation */}
      <Stack gap="xs">
        {/* Logo / Brand */}
        <Group h={64} px="md" justify="space-between" style={{ borderBottom: '1px solid var(--sidebar-border)' }}>
          {sidebarOpen && (
            <Group gap="sm">
              <Box w={28} h={28} bg="blue.6" style={{ borderRadius: 6, display: 'grid', placeItems: 'center' }}>
                <Text c="white" fw={800} size="xs">P</Text>
              </Box>
              <div>
                <Text size="sm" fw={700} lh={1.1}>PMIX</Text>
                <Text size="xs" c="dimmed">Marketing OS</Text>
              </div>
            </Group>
          )}
          <ActionIcon
            onClick={toggleSidebar}
            variant="subtle"
            size="lg"
            aria-label={sidebarOpen ? 'Close sidebar' : 'Open sidebar'}
          >
            {sidebarOpen ? (
              <PanelLeftClose size={20} />
            ) : (
              <PanelLeftOpen size={20} />
            )}
          </ActionIcon>
        </Group>

        {/* Navigation */}
        <Stack gap={4} px="sm" mt="md">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            
            return (
              <NavLink
                key={item.name}
                href={item.href}
                active={isActive}
                label={sidebarOpen ? item.name : undefined}
                title={!sidebarOpen ? item.name : undefined}
                leftSection={<Icon size={18} strokeWidth={1.5} />}
                variant="subtle"
                color="blue"
                styles={{
                  root: {
                    borderRadius: 'var(--radius-md)',
                    minHeight: 42,
                    padding: sidebarOpen ? 'var(--space-2) var(--space-3)' : 'var(--space-2)',
                    marginBottom: 'var(--space-1)',
                    justifyContent: sidebarOpen ? 'flex-start' : 'center',
                    '&:hover': {
                      backgroundColor: 'var(--color-bg-tertiary)',
                    },
                  },
                }}
              />
            );
          })}
        </Stack>
      </Stack>

      {/* Bottom Section: User Menu */}
      <Divider my="xs" />
      <div style={{ padding: 'var(--space-4)' }}>
        <UserMenu />
      </div>
    </Stack>
  );
}
