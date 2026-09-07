import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { resetPasswordFormSchema, type ResetPasswordFormValues } from '../schemas/authSchemas';
import { useResetPassword } from '../hooks/useAuth';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const resetPassword = useResetPassword();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormValues>({ resolver: zodResolver(resetPasswordFormSchema) });

  const onSubmit = (values: ResetPasswordFormValues) => {
    if (!token) return;
    resetPassword.mutate({ token, newPassword: values.newPassword });
  };

  const serverError =
    resetPassword.isError && axios.isAxiosError(resetPassword.error)
      ? (resetPassword.error.response?.data as { error?: { message?: string } })?.error?.message
      : resetPassword.isError
        ? 'Something went wrong. Please try again.'
        : null;

  if (!token) {
    return (
      <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-12">
        <h1 className="text-2xl font-bold text-slate-900">Invalid reset link</h1>
        <p className="mt-2 text-sm text-slate-500">
          This password reset link is missing its token. Request a new one below.
        </p>
        <Link
          to="/forgot-password"
          className="mt-6 inline-block rounded-full bg-primary-600 px-4 py-2.5 text-center font-medium text-white hover:bg-primary-700"
        >
          Request a new link
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-12">
      <h1 className="text-2xl font-bold text-slate-900">Choose a new password</h1>
      <p className="mt-1 text-sm text-slate-500">This link can only be used once and expires after 1 hour.</p>

      <form className="mt-8 space-y-5" onSubmit={handleSubmit(onSubmit)} noValidate>
        {serverError && (
          <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {serverError}
          </div>
        )}

        <div>
          <label htmlFor="newPassword" className="block text-sm font-medium text-slate-700">
            New password
          </label>
          <input
            id="newPassword"
            type="password"
            autoComplete="new-password"
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
            aria-invalid={Boolean(errors.newPassword)}
            {...register('newPassword')}
          />
          {errors.newPassword && <p className="mt-1 text-sm text-red-600">{errors.newPassword.message}</p>}
          <p className="mt-1 text-xs text-slate-400">At least 8 characters.</p>
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700">
            Confirm new password
          </label>
          <input
            id="confirmPassword"
            type="password"
            autoComplete="new-password"
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
            aria-invalid={Boolean(errors.confirmPassword)}
            {...register('confirmPassword')}
          />
          {errors.confirmPassword && <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>}
        </div>

        <button
          type="submit"
          disabled={isSubmitting || resetPassword.isPending}
          className="w-full rounded-full bg-primary-600 px-4 py-2.5 font-medium text-white hover:bg-primary-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 disabled:opacity-60"
        >
          {resetPassword.isPending ? 'Resetting…' : 'Reset password'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500">
        Remembered your password?{' '}
        <Link to="/login" className="font-medium text-primary-700 hover:underline">
          Log in
        </Link>
      </p>
    </div>
  );
}
