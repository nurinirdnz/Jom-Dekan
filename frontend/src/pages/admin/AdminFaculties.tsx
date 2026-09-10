import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import axios from "axios";
import { AdminPageShell } from "../../layouts/AdminPageShell";
import {
  useUniversities,
  useFaculties,
  useCreateFaculty,
  useSetFacultyStatus,
} from "../../hooks/useTaxonomy";

// Only "name" is collected here — universityId comes from the picker
// below, not from this form, so the schema stays deliberately small.
const facultyNameSchema = z.object({
  name: z.string().trim().min(2, "Enter at least 2 characters.").max(200),
});
type FacultyNameValues = z.infer<typeof facultyNameSchema>;

export default function AdminFaculties({
  embedded = false,
}: {
  embedded?: boolean;
}) {
  const { data: universities } = useUniversities();
  const [universityId, setUniversityId] = useState("");

  const {
    data: faculties,
    isLoading,
    isError,
  } = useFaculties(universityId || undefined);
  const createFaculty = useCreateFaculty();
  const setStatus = useSetFacultyStatus();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FacultyNameValues>({ resolver: zodResolver(facultyNameSchema) });

  const onSubmit = (values: FacultyNameValues) => {
    if (!universityId) return;
    createFaculty.mutate(
      { universityId, name: values.name },
      { onSuccess: () => reset() },
    );
  };

  const serverError =
    createFaculty.isError && axios.isAxiosError(createFaculty.error)
      ? (createFaculty.error.response?.data as { error?: { message?: string } })
          ?.error?.message
      : null;

  return (
    <AdminPageShell embedded={embedded}>
      <h1 className="text-2xl font-bold text-slate-900">Faculties</h1>
      <p className="mt-1 text-sm text-slate-500">
        Pick a university to manage its faculties. Only admins can create, edit,
        or archive.
      </p>

      <div className="mt-6">
        <label
          htmlFor="universityId"
          className="block text-sm font-medium text-slate-700"
        >
          University
        </label>
        <select
          id="universityId"
          value={universityId}
          onChange={(e) => setUniversityId(e.target.value)}
          className="mt-1 w-72 rounded-lg border border-slate-300 px-3 py-2 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="">Select a university…</option>
          {universities?.map((u) => (
            <option key={u.id} value={u.id}>
              {u.name}
            </option>
          ))}
        </select>
      </div>

      {universityId && (
        <>
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
                htmlFor="name"
                className="block text-sm font-medium text-slate-700"
              >
                Faculty name
              </label>
              <input
                id="name"
                className="mt-1 w-64 rounded-lg border border-slate-300 px-3 py-2 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
                aria-invalid={Boolean(errors.name)}
                {...register("name")}
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.name.message}
                </p>
              )}
            </div>
            <button
              type="submit"
              disabled={isSubmitting || createFaculty.isPending}
              className="rounded-full bg-primary-600 px-5 py-2.5 font-medium text-white hover:bg-primary-700 disabled:opacity-60"
            >
              {createFaculty.isPending ? "Adding…" : "Add faculty"}
            </button>
          </form>

          <div className="mt-6 overflow-x-auto rounded-xl border border-slate-200 bg-white">
            {isLoading ? (
              <p className="p-4 text-sm text-slate-500">Loading…</p>
            ) : isError ? (
              <p className="p-4 text-sm text-red-600">
                Could not load faculties.
              </p>
            ) : faculties && faculties.length > 0 ? (
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-500">
                  <tr>
                    <th className="px-4 py-2">Name</th>
                    <th className="px-4 py-2">Status</th>
                    <th className="px-4 py-2 text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {faculties.map((f) => (
                    <tr key={f.id} className="border-t border-slate-100">
                      <td className="px-4 py-2 font-medium text-slate-800">
                        {f.name}
                      </td>
                      <td className="px-4 py-2">
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                            f.isActive
                              ? "bg-green-100 text-green-700"
                              : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          {f.isActive ? "Active" : "Archived"}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-right">
                        <button
                          type="button"
                          onClick={() =>
                            setStatus.mutate({
                              id: f.id,
                              isActive: !f.isActive,
                            })
                          }
                          disabled={setStatus.isPending}
                          className="text-sm font-medium text-primary-700 hover:underline disabled:opacity-60"
                        >
                          {f.isActive ? "Archive" : "Restore"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="p-4 text-sm text-slate-500">
                No faculties yet for this university — add one above.
              </p>
            )}
          </div>
        </>
      )}
    </AdminPageShell>
  );
}
