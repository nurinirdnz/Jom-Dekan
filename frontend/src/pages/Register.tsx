import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { registerFormSchema, type RegisterFormValues } from '../schemas/authSchemas';
import { useRegister } from '../hooks/useAuth';
import { useUniversities } from '../hooks/useTaxonomy';
import { FIELDS_OF_STUDY } from '../constants/fieldsOfStudy';
import { SearchableSelect } from '../components/common/SearchableSelect';

const CURRENT_SEMESTER_OPTIONS = Array.from({ length: 10 }, (_, i) => i + 1);

export default function Register() {
  const registerAccount = useRegister();
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({ resolver: zodResolver(registerFormSchema) });

  const { data: universities } = useUniversities();
  const universityOptions = (universities ?? []).map((u) => ({ value: u.id, label: u.name }));
  const fieldOfStudyOptions = FIELDS_OF_STUDY.map((field) => ({ value: field, label: field }));

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

        <fieldset>
          <legend className="block text-sm font-medium text-slate-700">I am registering as a</legend>
          <div className="mt-1 flex gap-4">
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input type="radio" value="STUDENT" {...register('academicRole')} defaultChecked />
              Student
            </label>
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input type="radio" value="TUTOR" {...register('academicRole')} />
              Tutor
            </label>
          </div>
          {errors.academicRole && <p className="mt-1 text-sm text-red-600">{errors.academicRole.message}</p>}
        </fieldset>

        <div>
          <label htmlFor="universityId" className="block text-sm font-medium text-slate-700">
            University
          </label>
          <Controller
            control={control}
            name="universityId"
            render={({ field }) => (
              <SearchableSelect
                id="universityId"
                options={universityOptions}
                value={field.value ?? ''}
                onChange={field.onChange}
                onBlur={field.onBlur}
                placeholder="Search for your university…"
                ariaInvalid={Boolean(errors.universityId)}
              />
            )}
          />
          {errors.universityId && <p className="mt-1 text-sm text-red-600">{errors.universityId.message}</p>}
        </div>

        <div>
          <label htmlFor="fieldOfStudy" className="block text-sm font-medium text-slate-700">
            Field of study
          </label>
          <Controller
            control={control}
            name="fieldOfStudy"
            render={({ field }) => (
              <SearchableSelect
                id="fieldOfStudy"
                options={fieldOfStudyOptions}
                value={field.value ?? ''}
                onChange={field.onChange}
                onBlur={field.onBlur}
                placeholder="Search for your field of study…"
                ariaInvalid={Boolean(errors.fieldOfStudy)}
              />
            )}
          />
          {errors.fieldOfStudy && <p className="mt-1 text-sm text-red-600">{errors.fieldOfStudy.message}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="currentYear" className="block text-sm font-medium text-slate-700">
              Current year of study
            </label>
            <input
              id="currentYear"
              type="number"
              min={1}
              max={8}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
              aria-invalid={Boolean(errors.currentYear)}
              {...register('currentYear')}
            />
            {errors.currentYear && <p className="mt-1 text-sm text-red-600">{errors.currentYear.message}</p>}
          </div>

          <div>
            <label htmlFor="currentSemester" className="block text-sm font-medium text-slate-700">
              Current semester
            </label>
            <select
              id="currentSemester"
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
              aria-invalid={Boolean(errors.currentSemester)}
              {...register('currentSemester')}
            >
              <option value="">Select</option>
              {CURRENT_SEMESTER_OPTIONS.map((semester) => (
                <option key={semester} value={semester}>
                  Semester {semester}
                </option>
              ))}
            </select>
            {errors.currentSemester && <p className="mt-1 text-sm text-red-600">{errors.currentSemester.message}</p>}
          </div>
        </div>

        <div>
          <label className="flex items-start gap-2 text-sm text-slate-700">
            <input type="checkbox" className="mt-0.5" {...register('termsAccepted')} />
            <span>
              I agree to the{' '}
              <details className="inline">
                <summary className="inline cursor-pointer font-medium text-primary-700 hover:underline">
                  Terms &amp; Conditions
                </summary>
                <p className="mt-2 rounded-lg bg-slate-50 p-3 text-xs text-slate-500">
                  By creating a JomDekan account, you agree to use the platform respectfully, only upload material
                  you have the right to share, and understand that violations may result in account suspension.
                </p>
              </details>
            </span>
          </label>
          {errors.termsAccepted && <p className="mt-1 text-sm text-red-600">{errors.termsAccepted.message}</p>}
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
