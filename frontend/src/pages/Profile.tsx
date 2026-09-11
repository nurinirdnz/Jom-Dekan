import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import axios from 'axios';
import { updateProfileFormSchema, type UpdateProfileFormValues } from '../schemas/profileSchemas';
import { useMyProfile, useMyStats, useUpdateProfile } from '../hooks/useProfile';
import { useForgotPassword } from '../hooks/useAuth';
import { useUniversities } from '../hooks/useTaxonomy';
import { FIELDS_OF_STUDY } from '../constants/fieldsOfStudy';
import { SearchableSelect } from '../components/common/SearchableSelect';

const CURRENT_SEMESTER_OPTIONS = Array.from({ length: 10 }, (_, i) => i + 1);

// Same reasoning as the header/sidebar's disabled menu items elsewhere
// in this app — these need a real preferences endpoint before a toggle
// here would mean anything.
const PREFERENCES = [
  { label: 'Forum replies', meta: 'Email me when someone answers my thread' },
  { label: 'Upload verification', meta: 'Notify me when moderation completes' },
  { label: 'Weekly digest', meta: 'Top resources for my courses each Sunday' },
  { label: 'Public profile', meta: 'Show my uploads and contributor rating' },
];

function DisabledToggle() {
  return (
    <span
      title="Coming soon"
      className="relative inline-flex h-[26px] w-[46px] shrink-0 cursor-not-allowed items-center rounded-full bg-slate-200"
    >
      <span className="absolute left-[3px] h-5 w-5 rounded-full bg-white shadow-sm" />
    </span>
  );
}

export default function Profile() {
  const { data: profile, isLoading } = useMyProfile();
  const { data: stats } = useMyStats();
  const updateProfile = useUpdateProfile();
  const forgotPassword = useForgotPassword();
  const [resetSent, setResetSent] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<UpdateProfileFormValues>({ resolver: zodResolver(updateProfileFormSchema) });

  const {
    data: universities,
    isLoading: universitiesLoading,
    isError: universitiesError,
    refetch: refetchUniversities,
  } = useUniversities();
  const universityOptions = (universities ?? []).map((u) => ({ value: u.id, label: u.name }));
  const fieldOfStudyOptions = FIELDS_OF_STUDY.map((field) => ({ value: field, label: field }));

  useEffect(() => {
    if (profile) {
      reset({
        displayName: profile.displayName,
        academicRole: profile.academicRole,
        universityId: profile.university?.id ?? '',
        fieldOfStudy: (profile.fieldOfStudy ?? '') as UpdateProfileFormValues['fieldOfStudy'],
        currentYear: profile.currentYear ?? 1,
        currentSemester: profile.currentSemester ?? 1,
      });
    }
  }, [profile, reset]);

  const onSubmit = (values: UpdateProfileFormValues) => {
    updateProfile.mutate({
      displayName: values.displayName,
      academicRole: values.academicRole,
      universityId: values.universityId,
      fieldOfStudy: values.fieldOfStudy,
      currentYear: values.currentYear,
      currentSemester: values.currentSemester,
    });
  };

  function handleSendResetLink() {
    if (!profile?.email) return;
    forgotPassword.mutate({ email: profile.email }, { onSuccess: () => setResetSent(true) });
  }

  const serverError =
    updateProfile.isError && axios.isAxiosError(updateProfile.error)
      ? (updateProfile.error.response?.data as { error?: { message?: string } })?.error?.message
      : updateProfile.isError
        ? 'Something went wrong. Please try again.'
        : null;

  if (isLoading || !profile) {
    return <div className="mx-auto max-w-[1000px] px-[18px] py-[22px] text-sm text-slate-500">Loading profile…</div>;
  }

  return (
    <div className="mx-auto max-w-[1000px] px-[18px] py-[22px]">
      <h1 className="text-2xl font-bold text-slate-900">Profile &amp; Settings</h1>
      <p className="mt-1 text-sm text-slate-500">Your details, contribution record and notification preferences.</p>

      {/* Hero — same gradient family as the dashboard's hero card. */}
      <div
        className="mt-6 flex flex-wrap items-center justify-between gap-5 rounded-[22px] p-[22px] text-white"
        style={{ background: 'radial-gradient(120% 140% at 85% 10%, #4A3FD1 0%, #2E2372 55%, #231C57 100%)' }}
      >
        <div className="flex min-w-0 flex-1 items-center gap-4">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-[20px] bg-[#F5C21A] text-xl font-extrabold text-[#231C57]">
            {profile.email[0]?.toUpperCase() ?? '?'}
          </div>
          <div className="min-w-0">
            <p className="truncate text-xl font-extrabold tracking-tight">{profile.displayName}</p>
            <p className="truncate text-sm font-medium text-[#C6C2EC]">
              {profile.role === 'ADMIN' ? 'Administrator' : profile.academicRole === 'TUTOR' ? 'Tutor' : 'Student'}
            </p>
          </div>
        </div>

        <div
          className="grid flex-1 grid-cols-2 gap-0 overflow-hidden rounded-2xl border border-white/[.16] bg-white/[.09] sm:grid-cols-4"
          style={{ minWidth: 260 }}
        >
          {[
            { label: 'Uploads', value: stats?.resourceCount ?? '—' },
            { label: 'Rating', value: '—' },
            { label: 'Downloads', value: '—' },
            { label: 'Threads', value: stats?.forumPostCount ?? '—' },
          ].map(({ label, value }, i) => (
            <div
              key={label}
              className={`flex flex-col items-center gap-1 px-2 py-4 ${i > 0 ? 'border-l border-white/[.12]' : ''}`}
            >
              <span className="text-xl font-extrabold leading-none">{value}</span>
              <span className="text-[11px] font-bold uppercase tracking-wide text-[#B9B4E4]">{label}</span>
            </div>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="mt-6 rounded-[22px] border border-[#ECEBF7] bg-white p-6 shadow-sm">
          <h2 className="font-semibold text-slate-800">Account details</h2>

          {serverError && (
            <div
              role="alert"
              className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
            >
              {serverError}
            </div>
          )}

          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-bold uppercase tracking-wide text-slate-500">Full name</span>
              <input
                type="text"
                className="h-11 rounded-xl border border-[#E4E3F2] px-3 text-sm font-medium text-slate-700 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
                aria-invalid={Boolean(errors.displayName)}
                {...register('displayName')}
              />
              {errors.displayName && <span className="text-xs text-red-600">{errors.displayName.message}</span>}
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-bold uppercase tracking-wide text-slate-500">Student email</span>
              <input
                type="text"
                value={profile.email}
                disabled
                title="Editing isn't available yet"
                className="h-11 cursor-not-allowed rounded-xl border border-[#E4E3F2] bg-slate-50 px-3 text-sm font-medium text-slate-700"
              />
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-bold uppercase tracking-wide text-slate-500">Registering as</span>
              <select
                className="h-11 rounded-xl border border-[#E4E3F2] px-3 text-sm font-medium text-slate-700 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
                {...register('academicRole')}
              >
                <option value="STUDENT">Student</option>
                <option value="TUTOR">Tutor</option>
              </select>
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-bold uppercase tracking-wide text-slate-500">University</span>
              <Controller
                control={control}
                name="universityId"
                render={({ field }) => (
                  <SearchableSelect
                    options={universityOptions}
                    value={field.value ?? ''}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    disabled={universitiesLoading || universitiesError}
                    placeholder={
                      universitiesLoading
                        ? 'Loading universities…'
                        : universitiesError
                          ? 'Could not load universities.'
                          : 'Search for your university…'
                    }
                    ariaInvalid={Boolean(errors.universityId)}
                  />
                )}
              />
              {errors.universityId && <span className="text-xs text-red-600">{errors.universityId.message}</span>}
              {universitiesError && (
                <span className="text-xs text-red-600">
                  Couldn't load the list of universities.{' '}
                  <button type="button" onClick={() => refetchUniversities()} className="font-medium underline">
                    Try again
                  </button>
                </span>
              )}
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-bold uppercase tracking-wide text-slate-500">Field of study</span>
              <Controller
                control={control}
                name="fieldOfStudy"
                render={({ field }) => (
                  <SearchableSelect
                    options={fieldOfStudyOptions}
                    value={field.value ?? ''}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    placeholder="Search for your field of study…"
                    ariaInvalid={Boolean(errors.fieldOfStudy)}
                  />
                )}
              />
              {errors.fieldOfStudy && <span className="text-xs text-red-600">{errors.fieldOfStudy.message}</span>}
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-bold uppercase tracking-wide text-slate-500">Current year</span>
              <input
                type="number"
                min={1}
                max={8}
                className="h-11 rounded-xl border border-[#E4E3F2] px-3 text-sm font-medium text-slate-700 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
                aria-invalid={Boolean(errors.currentYear)}
                {...register('currentYear')}
              />
              {errors.currentYear && <span className="text-xs text-red-600">{errors.currentYear.message}</span>}
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-bold uppercase tracking-wide text-slate-500">Current semester</span>
              <select
                className="h-11 rounded-xl border border-[#E4E3F2] px-3 text-sm font-medium text-slate-700 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
                aria-invalid={Boolean(errors.currentSemester)}
                {...register('currentSemester')}
              >
                {CURRENT_SEMESTER_OPTIONS.map((semester) => (
                  <option key={semester} value={semester}>
                    Semester {semester}
                  </option>
                ))}
              </select>
              {errors.currentSemester && (
                <span className="text-xs text-red-600">{errors.currentSemester.message}</span>
              )}
            </label>
          </div>

          <h2 className="mt-8 font-semibold text-slate-800">Preferences</h2>
          <p className="mt-0.5 text-sm text-slate-500">These aren&apos;t wired up to a real preferences endpoint yet.</p>
          <div className="mt-4 flex flex-col gap-2">
            {PREFERENCES.map(({ label, meta }) => (
              <div
                key={label}
                className="flex items-center justify-between gap-4 rounded-xl border border-[#ECEBF7] p-3.5"
              >
                <div className="min-w-0">
                  <p className="text-sm font-bold text-slate-800">{label}</p>
                  <p className="text-xs text-slate-500">{meta}</p>
                </div>
                <DisabledToggle />
              </div>
            ))}
          </div>

          <h2 className="mt-8 font-semibold text-slate-800">Password &amp; security</h2>
          <div className="mt-4 rounded-xl border border-[#ECEBF7] p-4">
            <p className="text-xs font-medium text-slate-400">
              Direct password changes aren&apos;t available yet — use the email reset link below instead.
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-4">
              <button
                type="button"
                onClick={handleSendResetLink}
                disabled={forgotPassword.isPending || resetSent}
                className="h-11 rounded-xl bg-slate-100 px-5 text-sm font-bold text-slate-700 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:text-slate-400"
              >
                {resetSent
                  ? 'Reset link sent — check your email'
                  : forgotPassword.isPending
                    ? 'Sending…'
                    : 'Send me a reset link'}
              </button>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={isSubmitting || updateProfile.isPending}
              className="h-11 rounded-xl bg-primary-600 px-5 text-sm font-bold text-white transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {updateProfile.isPending ? 'Saving…' : 'Save changes'}
            </button>
            <button
              type="button"
              disabled
              title="Coming soon — no account-deletion endpoint yet"
              className="h-11 cursor-not-allowed rounded-xl border border-slate-200 px-5 text-sm font-bold text-slate-400"
            >
              Delete account
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
