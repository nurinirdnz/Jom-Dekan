import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { AdminLayout } from "../../layouts/AdminLayout";
import {
  subjectFormSchema,
  type SubjectFormValues,
} from "../../schemas/taxonomySchemas";
import {
  useSubjects,
  useCreateSubject,
  useSetSubjectStatus,
} from "../../hooks/useTaxonomy";

export default function AdminSubjects() {
  const { data: subjects, isLoading, isError } = useSubjects();
  const createSubject = useCreateSubject();
  const setStatus = useSetSubjectStatus();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SubjectFormValues>({ resolver: zodResolver(subjectFormSchema) });

  const onSubmit = (values: SubjectFormValues) =>
    createSubject.mutate(values, { onSuccess: () => reset() });

  const serverError =
    createSubject.isError && axios.isAxiosError(createSubject.error)
      ? (createSubject.error.response?.data as { error?: { message?: string } })
          ?.error?.message
      : null;

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold text-slate-900">Subjects</h1>
      <p className="mt-1 text-sm text-slate-500">
        Subjects are standalone (e.g. CSC510) and get linked to programmes
        separately.
      </p>

      <form
        className="mt-6 flex flex-wrap items-end gap-3 rounded-xl border border-slate-200 bg-white p-4"
        onSubmit={handleSubmit(onSubmit)}
        noValidate
      >
        {serverError && (
          <div
            role="alert"
            className="w-full rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700"
          >
            {serverError}
          </div>
        )}
        <div>
          <label
            htmlFor="code"
            className="block text-sm font-medium text-slate-700"
          >
            Code
          </label>
          <input
            id="code"
            placeholder="CSC510"
            className="mt-1 w-32 rounded-lg border border-slate-300 px-3 py-2 uppercase focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
            aria-invalid={Boolean(errors.code)}
            {...register("code")}
          />
          {errors.code && (
            <p className="mt-1 text-sm text-red-600">{errors.code.message}</p>
          )}
        </div>
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-slate-700"
          >
            Name
          </label>
          <input
            id="name"
            className="mt-1 w-64 rounded-lg border border-slate-300 px-3 py-2 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
            aria-invalid={Boolean(errors.name)}
            {...register("name")}
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
          )}
        </div>
        <button
          type="submit"
          disabled={isSubmitting || createSubject.isPending}
          className="rounded-full bg-primary-600 px-5 py-2.5 font-medium text-white hover:bg-primary-700 disabled:opacity-60"
        >
          {createSubject.isPending ? "Adding…" : "Add subject"}
        </button>
      </form>

      <div className="mt-6 overflow-x-auto rounded-xl border border-slate-200 bg-white">
        {isLoading ? (
          <p className="p-4 text-sm text-slate-500">Loading…</p>
        ) : isError ? (
          <p className="p-4 text-sm text-red-600">Could not load subjects.</p>
        ) : subjects && subjects.length > 0 ? (
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-4 py-2">Code</th>
                <th className="px-4 py-2">Name</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {subjects.map((s) => (
                <tr key={s.id} className="border-t border-slate-100">
                  <td className="px-4 py-2 font-medium text-slate-800">
                    {s.code}
                  </td>
                  <td className="px-4 py-2 text-slate-600">{s.name}</td>
                  <td className="px-4 py-2">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        s.isActive
                          ? "bg-green-100 text-green-700"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {s.isActive ? "Active" : "Archived"}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-right">
                    <button
                      type="button"
                      onClick={() =>
                        setStatus.mutate({ id: s.id, isActive: !s.isActive })
                      }
                      disabled={setStatus.isPending}
                      className="text-sm font-medium text-primary-700 hover:underline disabled:opacity-60"
                    >
                      {s.isActive ? "Archive" : "Restore"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="p-4 text-sm text-slate-500">
            No subjects yet — add one above.
          </p>
        )}
      </div>
    </AdminLayout>
  );
}
