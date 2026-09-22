'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Home, Box, User, Rocket, Settings, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { useUIStore } from '@/stores';
import UserMenu from './user-menu';

const menuItems = [
  { name: 'Dashboard', href: '/', icon: Home },
  { name: 'Products', href: '/products', icon: Box },
  { name: 'Customers', href: '/customers', icon: User },
  { name: 'Campaigns', href: '/campaigns', icon: Rocket },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const sidebarOpen = useUIStore((state) => state.sidebarOpen);
  const toggleSidebar = useUIStore((state) => state.toggleSidebar);
  const [hovered, setHovered] = useState(false);

  const isCollapsed = !sidebarOpen;
  const showLabels = sidebarOpen || hovered;

  return (
    <aside
      className={`h-screen bg-sidebar border-r border-border flex flex-col fixed left-0 top-0 z-40 transition-all duration-300 ease-in-out ${
        isCollapsed ? 'w-16' : 'w-64'
      }`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="h-16 flex items-center justify-between px-4 border-b border-border">
        {showLabels && (
          <h1 className="text-lg font-semibold text-foreground whitespace-nowrap">pmix</h1>
        )}
        <button
          onClick={toggleSidebar}
          className="p-1.5 rounded-md hover:bg-sidebar-hover text-gray-600 hover:text-foreground transition-colors"
          aria-label={isCollapsed ? 'Open sidebar' : 'Close sidebar'}
        >
          {isCollapsed ? (
            <PanelLeftOpen className="w-5 h-5" stroke="1.5" />
          ) : (
            <PanelLeftClose className="w-5 h-5" stroke="1.5" />
          )}
        </button>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto sidebar-scroll">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                isActive
                  ? 'bg-sidebar-hover text-foreground font-medium'
                  : 'text-gray-600 hover:bg-sidebar-hover hover:text-foreground'
              }`}
              title={isCollapsed ? item.name : undefined}
            >
              <Icon className="w-4 h-4 flex-shrink-0" stroke="1.5" />
              {showLabels && <span className="whitespace-nowrap">{item.name}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-border">
        <UserMenu />
      </div>
    </aside>
  );
}
