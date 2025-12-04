'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useLoginMutation } from '@/features/auth/api/authApi';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

const loginSchema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [login, { isLoading }] = useLoginMutation();

  const { register, handleSubmit, formState: { errors }, } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: 'admin@example.com',
      password: 'Admin@123',
    },
  });

  const onSubmit = async (values: LoginFormValues) => {
    setServerError(null);
    try {
      const result = await login(values).unwrap();
      if (result?.success) {
        router.push('/products');
      }
    } catch (err: any) {
      const message =
        err?.data?.message || 'Login failed. Please check your credentials.';
      setServerError(message);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-800 flex items-center justify-center px-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center text-slate-200">
          <h1 className="text-3xl font-semibold tracking-tight">
            Real-Time Product Dashboard
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            Sign in to manage products and view analytics.
          </p>
        </div>
        <Card className="border border-slate-800 bg-slate-950/80 text-slate-100">
          <CardHeader>
            <CardTitle className="text-xl text-center">Admin Login</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-1">
                <Label
                  htmlFor="email"
                  className="text-xs uppercase tracking-wide text-slate-300"
                >
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@example.com"
                  className="bg-slate-900 border-slate-800 text-slate-100 placeholder:text-slate-500 focus-visible:ring-sky-500 focus-visible:ring-offset-0"
                  {...register('email')}
                />

                {errors.email && (
                  <p className="text-xs text-red-400 mt-1">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <Label
                  htmlFor="password"
                  className="text-xs uppercase tracking-wide text-slate-300"
                >
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  className="bg-slate-900 border-slate-800 text-slate-100 placeholder:text-slate-500 focus-visible:ring-sky-500 focus-visible:ring-offset-0"
                  {...register('password')}
                />

                {errors.password && (
                  <p className="text-xs text-red-400 mt-1">
                    {errors.password.message}
                  </p>
                )}
              </div>

              {serverError && (
                <p className="text-sm text-red-400 bg-red-950/40 border border-red-900 rounded-md px-3 py-2">
                  {serverError}
                </p>
              )}

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-sky-600 text-white hover:bg-sky-500"
              >
                {isLoading ? 'Signing in...' : 'Sign in'}
              </Button>
            </form>
          </CardContent>
          <CardFooter>
            <p className="text-xs text-slate-500 text-center w-full">
              Demo credentials: <span className="font-mono">admin@example.com</span> /{' '}
              <span className="font-mono">Admin@123</span>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}