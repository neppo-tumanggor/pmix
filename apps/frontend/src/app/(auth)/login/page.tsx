import LoginForm from '@/components/auth/login-form';

export default function LoginPage() {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">PMIX</h1>
        <p className="text-sm text-gray-600">
          Sign in to your account to continue
        </p>
      </div>
      <LoginForm />
      <div className="text-center text-sm text-gray-600">
        <p>
          Demo credentials: admin@pmix.com / admin123
        </p>
      </div>
    </div>
  );
}
