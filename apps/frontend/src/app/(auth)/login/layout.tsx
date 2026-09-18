export const metadata = {
  title: 'Login - PMIX',
  description: 'Sign in to your PMIX account',
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-full flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md px-4">
        {children}
      </div>
    </div>
  );
}
