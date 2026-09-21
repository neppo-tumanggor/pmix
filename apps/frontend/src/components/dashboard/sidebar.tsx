'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  IconDashboard,
  IconBox,
  IconUser,
  IconRocket,
  IconSettings,
} from '@tabler/icons-react';

const menuItems = [
  { name: 'Dashboard', href: '/', icon: IconDashboard },
  { name: 'Products', href: '/products', icon: IconBox },
  { name: 'Customers', href: '/customers', icon: IconUser },
  { name: 'Campaigns', href: '/campaigns', icon: IconRocket },
  { name: 'Settings', href: '/settings', icon: IconSettings },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 h-screen bg-sidebar border-r border-border flex flex-col fixed left-0 top-0">
      <div className="h-16 flex items-center px-6 border-b border-border">
        <h1 className="text-lg font-semibold text-foreground">pmix</h1>
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
            >
              <Icon className="w-4 h-4" stroke={1.5} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-border">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
            <span className="text-xs font-medium text-gray-700">U</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">
              User
            </p>
            <p className="text-xs text-gray-500 truncate">user@example.com</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
