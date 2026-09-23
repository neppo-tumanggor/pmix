'use client';

import * as React from 'react';
import { useUIStore } from '@/stores';

/**
 * PMIX Design System - Theme Provider
 * Swiss Design Standard - Dark Mode Support
 * 
 * Implements theme switching with CSS variables
 */

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useUIStore((state) => state.theme);
  const setTheme = useUIStore((state) => state.setTheme);

  React.useEffect(() => {
    const root = document.documentElement;
    
    if (theme === 'dark') {
      root.setAttribute('data-theme', 'dark');
    } else {
      root.removeAttribute('data-theme');
    }
  }, [theme]);

  return <>{children}</>;
}
