import { redirect } from 'next/navigation';
import { useAuthStore } from '@/stores';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Note: This is a server component, so we can't use Zustand directly
  // The client-side redirect will be handled in page.tsx
  return <>{children}</>;
}
