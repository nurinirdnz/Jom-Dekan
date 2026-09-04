import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { registerFormSchema, type RegisterFormValues } from '../schemas/authSchemas';
import { useRegister } from '../hooks/useAuth';

export default function Register() {
  const registerAccount = useRegister();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({ resolver: zodResolver(registerFormSchema) });

  const onSubmit = (values: RegisterFormValues) => registerAccount.mutate(values);

  const serverError =
    registerAccount.isError && axios.isAxiosError(registerAccount.error)
      ? (registerAccount.error.response?.data as { error?: { message?: string } })?.error?.message
      : registerAccount.isError
        ? 'Something went wrong. Please try again.'
        : null;

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-12">
      <h1 className="text-2xl font-bold text-slate-900">Create your JomDekan account</h1>
      <p className="mt-1 text-sm text-slate-500">
        For Malaysian university students — past papers, notes, discussions, and legitimate tutoring, all in one place.
      </p>

      <form className="mt-8 space-y-5" onSubmit={handleSubmit(onSubmit)} noValidate>
        {serverError && (
          <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {serverError}
          </div>
        )}

        <div>
          <label htmlFor="displayName" className="block text-sm font-medium text-slate-700">
            Full name
          </label>
          <input
            id="displayName"
            type="text"
            autoComplete="name"
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
            aria-invalid={Boolean(errors.displayName)}
            {...register('displayName')}
          />
          {errors.displayName && <p className="mt-1 text-sm text-red-600">{errors.displayName.message}</p>}
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-slate-700">
            Email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
            aria-invalid={Boolean(errors.email)}
            {...register('email')}
          />
          {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-slate-700">
            Password
          </label>
          <input
            id="password"
            type="password"
            autoComplete="new-password"
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
            aria-invalid={Boolean(errors.password)}
            {...register('password')}
          />
          {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>}
          <p className="mt-1 text-xs text-slate-400">At least 8 characters.</p>
        </div>

        <button
          type="submit"
          disabled={isSubmitting || registerAccount.isPending}
          className="w-full rounded-full bg-primary-600 px-4 py-2.5 font-medium text-white hover:bg-primary-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 disabled:opacity-60"
        >
          {registerAccount.isPending ? 'Creating account…' : 'Create account'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500">
        Already have an account?{' '}
        <Link to="/login" className="font-medium text-primary-700 hover:underline">
          Log in
        </Link>
      </p>
    </div>
  );
}
