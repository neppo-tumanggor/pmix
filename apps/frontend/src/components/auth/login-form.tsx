'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import LoginFormFields from './login-form-fields';
import { useAuthStore } from '@/stores';
import { authApi } from '@/lib/api/auth';
import { LoginFormData } from '@/lib/validations/auth';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';

export default function LoginForm() {
  const router = useRouter();
  const { login, setLoading, setError, clearError } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setLocalError] = useState<string | null>(null);

  const handleSubmit = async (data: LoginFormData) => {
    try {
      setIsLoading(true);
      clearError();
      setLocalError(null);

      const response = await authApi.login(data);
      
      const { accessToken, refreshToken, user } = response.data;
      
      // Store in Zustand
      login(user, accessToken, refreshToken);
      
      // Redirect to products page
      router.push('/products');
      router.refresh();
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || err?.message || 'Login failed. Please try again.';
      setLocalError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl">Welcome back</CardTitle>
        <CardDescription>
          Sign in to your account to continue
        </CardDescription>
      </CardHeader>
      <CardContent>
        <LoginFormFields
          onSubmit={handleSubmit}
          isLoading={isLoading}
          error={error}
        />
      </CardContent>
    </Card>
  );
}
