'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, type LoginFormData } from '@/lib/validations/auth';
import { Button } from '@/components/ui/button';
import { TextInput, PasswordInput } from '@mantine/core';

export interface LoginFormFieldsProps {
  onSubmit: (data: LoginFormData) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

export default function LoginFormFields({ onSubmit, isLoading, error }: LoginFormFieldsProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {error && (
        <div className="rounded-md bg-red-50 border border-red-200 p-3">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <div className="space-y-2">
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
        <TextInput
          id="email"
          type="email"
          placeholder="admin@pmix.com"
          autoComplete="email"
          disabled={isLoading}
          error={errors.email?.message}
          {...register('email')}
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
        <PasswordInput
          id="password"
          placeholder="��������"
          autoComplete="current-password"
          disabled={isLoading}
          error={errors.password?.message}
          {...register('password')}
        />
      </div>

      <Button type="submit" disabled={isLoading}>
        {isLoading ? 'Signing in...' : 'Sign in'}
      </Button>
    </form>
  );
}
