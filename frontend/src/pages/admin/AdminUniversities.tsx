import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { AdminLayout } from "../../layouts/AdminLayout";
import {
  universityFormSchema,
  type UniversityFormValues,
} from "../../schemas/taxonomySchemas";
import {
  useUniversities,
  useCreateUniversity,
  useSetUniversityStatus,
} from "../../hooks/useTaxonomy";

export default function AdminUniversities() {
  const { data: universities, isLoading, isError } = useUniversities();
  const createUniversity = useCreateUniversity();
  const setStatus = useSetUniversityStatus();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<UniversityFormValues>({
    resolver: zodResolver(universityFormSchema),
  });

  const onSubmit = (values: UniversityFormValues) =>
    createUniversity.mutate(values, { onSuccess: () => reset() });

  const serverError =
    createUniversity.isError && axios.isAxiosError(createUniversity.error)
      ? (
          createUniversity.error.response?.data as {
            error?: { message?: string };
          }
        )?.error?.message
      : null;

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold text-slate-900">Universities</h1>
      <p className="mt-1 text-sm text-slate-500">
        Only admins can create, edit, or archive universities here. "Archive"
        hides a university from new picks without deleting it, so existing
        profiles/resources that reference it stay intact.
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
        <div>
          <label
            htmlFor="country"
            className="block text-sm font-medium text-slate-700"
          >
            Country
          </label>
          <input
            id="country"
            defaultValue="Malaysia"
            className="mt-1 w-40 rounded-lg border border-slate-300 px-3 py-2 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
            {...register("country")}
          />
        </div>
        <button
          type="submit"
          disabled={isSubmitting || createUniversity.isPending}
          className="rounded-full bg-primary-600 px-5 py-2.5 font-medium text-white hover:bg-primary-700 disabled:opacity-60"
        >
          {createUniversity.isPending ? "Adding…" : "Add university"}
        </button>
      </form>

      <div className="mt-6 overflow-x-auto rounded-xl border border-slate-200 bg-white">
        {isLoading ? (
          <p className="p-4 text-sm text-slate-500">Loading…</p>
        ) : isError ? (
          <p className="p-4 text-sm text-red-600">
            Could not load universities.
          </p>
        ) : universities && universities.length > 0 ? (
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-4 py-2">Name</th>
                <th className="px-4 py-2">Country</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {universities.map((u) => (
                <tr key={u.id} className="border-t border-slate-100">
                  <td className="px-4 py-2 font-medium text-slate-800">
                    {u.name}
                  </td>
                  <td className="px-4 py-2 text-slate-600">{u.country}</td>
                  <td className="px-4 py-2">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        u.isActive
                          ? "bg-green-100 text-green-700"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {u.isActive ? "Active" : "Archived"}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-right">
                    <button
                      type="button"
                      onClick={() =>
                        setStatus.mutate({ id: u.id, isActive: !u.isActive })
                      }
                      disabled={setStatus.isPending}
                      className="text-sm font-medium text-primary-700 hover:underline disabled:opacity-60"
                    >
                      {u.isActive ? "Archive" : "Restore"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="p-4 text-sm text-slate-500">
            No universities yet — add one above.
          </p>
        )}
      </div>
    </AdminLayout>
  );
}
