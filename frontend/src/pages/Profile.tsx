import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import axios from 'axios';
import { FileText, MessageSquare, Newspaper } from 'lucide-react';
import { updateProfileFormSchema, type UpdateProfileFormValues } from '../schemas/profileSchemas';
import { useMyProfile, useMyStats, useUpdateProfile } from '../hooks/useProfile';
import { useUniversities } from '../hooks/useTaxonomy';
import { FIELDS_OF_STUDY } from '../constants/fieldsOfStudy';
import { SearchableSelect } from '../components/common/SearchableSelect';

const CURRENT_SEMESTER_OPTIONS = Array.from({ length: 10 }, (_, i) => i + 1);

export default function Profile() {
  const { data: profile, isLoading } = useMyProfile();
  const { data: stats } = useMyStats();
  const updateProfile = useUpdateProfile();
  const [isEditing, setIsEditing] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<UpdateProfileFormValues>({ resolver: zodResolver(updateProfileFormSchema) });

  const { data: universities } = useUniversities();
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
    updateProfile.mutate(
      {
        displayName: values.displayName,
        academicRole: values.academicRole,
        universityId: values.universityId,
        fieldOfStudy: values.fieldOfStudy,
        currentYear: values.currentYear,
        currentSemester: values.currentSemester,
      },
      { onSuccess: () => setIsEditing(false) },
    );
  };

  const serverError =
    updateProfile.isError && axios.isAxiosError(updateProfile.error)
      ? (updateProfile.error.response?.data as { error?: { message?: string } })?.error?.message
      : updateProfile.isError
        ? 'Something went wrong. Please try again.'
        : null;

  if (isLoading || !profile) {
    return <div className="mx-auto max-w-2xl px-4 py-10 text-sm text-slate-500">Loading profile…</div>;
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-2xl font-bold text-slate-900">Your profile</h1>

      <div className="mt-6 grid grid-cols-3 gap-3">
        <StatCard icon={FileText} label="Materials" value={stats?.resourceCount} />
        <StatCard icon={Newspaper} label="Forum posts" value={stats?.forumPostCount} />
        <StatCard icon={MessageSquare} label="Comments" value={stats?.forumCommentCount} />
      </div>

      <div className="mt-6 rounded-xl border border-slate-200 bg-white p-6">
        {!isEditing ? (
          <>
            <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Full name" value={profile.displayName} />
              <Field label="Email" value={profile.email} />
              <Field label="Registering as" value={profile.academicRole === 'TUTOR' ? 'Tutor' : 'Student'} />
              <Field label="University" value={profile.university?.name ?? '—'} />
              <Field label="Field of study" value={profile.fieldOfStudy ?? '—'} />
              <Field label="Current year" value={profile.currentYear ? `Year ${profile.currentYear}` : '—'} />
              <Field label="Current semester" value={profile.currentSemester ? `Semester ${profile.currentSemester}` : '—'} />
            </dl>
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="mt-6 rounded-full bg-primary-600 px-5 py-2.5 font-medium text-white hover:bg-primary-700"
            >
              Edit profile
            </button>
          </>
        ) : (
          <form className="space-y-5" onSubmit={handleSubmit(onSubmit)} noValidate>
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
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
                aria-invalid={Boolean(errors.displayName)}
                {...register('displayName')}
              />
              {errors.displayName && <p className="mt-1 text-sm text-red-600">{errors.displayName.message}</p>}
            </div>

            <fieldset>
              <legend className="block text-sm font-medium text-slate-700">Registering as</legend>
              <div className="mt-1 flex gap-4">
                <label className="flex items-center gap-2 text-sm text-slate-700">
                  <input type="radio" value="STUDENT" {...register('academicRole')} />
                  Student
                </label>
                <label className="flex items-center gap-2 text-sm text-slate-700">
                  <input type="radio" value="TUTOR" {...register('academicRole')} />
                  Tutor
                </label>
              </div>
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
                {errors.currentSemester && (
                  <p className="mt-1 text-sm text-red-600">{errors.currentSemester.message}</p>
                )}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={isSubmitting || updateProfile.isPending}
                className="rounded-full bg-primary-600 px-5 py-2.5 font-medium text-white hover:bg-primary-700 disabled:opacity-60"
              >
                {updateProfile.isPending ? 'Saving…' : 'Save changes'}
              </button>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="rounded-full bg-slate-100 px-5 py-2.5 font-medium text-slate-700 hover:bg-slate-200"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</dt>
      <dd className="mt-0.5 text-sm text-slate-900">{value}</dd>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof FileText;
  label: string;
  value: number | undefined;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 text-center">
      <Icon className="mx-auto h-5 w-5 text-primary-600" aria-hidden="true" />
      <p className="mt-2 text-xl font-bold text-slate-900">{value ?? '—'}</p>
      <p className="text-xs text-slate-500">{label}</p>
    </div>
  );
}
