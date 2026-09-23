'use client';

import { AppShell } from '@mantine/core';
import { useUIStore } from '@/stores';
import Sidebar from '@/components/dashboard/sidebar';

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const sidebarOpen = useUIStore((state) => state.sidebarOpen);

  return (
    <AppShell
      navbar={{
        width: sidebarOpen ? 256 : 64,
        breakpoint: 'sm',
        collapsed: { mobile: !sidebarOpen, desktop: false },
      }}
      padding={0}
    >
      <AppShell.Navbar p={0}>
        <Sidebar />
      </AppShell.Navbar>

      <AppShell.Main style={{ background: 'var(--color-bg-secondary)', minHeight: '100vh' }}>
        {children}
      </AppShell.Main>
    </AppShell>
  );
}
