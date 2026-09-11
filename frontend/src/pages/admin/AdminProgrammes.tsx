import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import axios from "axios";
import { AdminPageShell } from "../../layouts/AdminPageShell";
import {
  useUniversities,
  useFaculties,
  useProgrammes,
  useCreateProgramme,
  useSetProgrammeStatus,
  useSubjects,
  useLinkSubjectToProgramme,
  useUnlinkSubjectFromProgramme,
} from "../../hooks/useTaxonomy";

const programmeCreateSchema = z.object({
  name: z.string().trim().min(2, "Enter at least 2 characters.").max(200),
  studyLevel: z.enum(["DIPLOMA", "DEGREE", "MASTERS", "PHD"]).optional(),
});
type ProgrammeCreateValues = z.infer<typeof programmeCreateSchema>;

export default function AdminProgrammes({
  embedded = false,
}: {
  embedded?: boolean;
}) {
  const { data: universities } = useUniversities();
  const [universityId, setUniversityId] = useState("");
  const { data: faculties } = useFaculties(universityId || undefined);
  const [facultyId, setFacultyId] = useState("");

  const {
    data: programmes,
    isLoading,
    isError,
  } = useProgrammes(facultyId || undefined);
  const createProgramme = useCreateProgramme();
  const setStatus = useSetProgrammeStatus();

  const [manageProgrammeId, setManageProgrammeId] = useState("");
  const { data: allSubjects } = useSubjects();
  const { data: linkedSubjects } = useSubjects(manageProgrammeId || undefined);
  const linkSubject = useLinkSubjectToProgramme();
  const unlinkSubject = useUnlinkSubjectFromProgramme();
  const [subjectToLink, setSubjectToLink] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProgrammeCreateValues>({
    resolver: zodResolver(programmeCreateSchema),
  });

  const onSubmit = (values: ProgrammeCreateValues) => {
    if (!facultyId) return;
    createProgramme.mutate(
      { facultyId, ...values },
      { onSuccess: () => reset() },
    );
  };

  const serverError =
    createProgramme.isError && axios.isAxiosError(createProgramme.error)
      ? (
          createProgramme.error.response?.data as {
            error?: { message?: string };
          }
        )?.error?.message
      : null;

  return (
    <AdminPageShell embedded={embedded}>
      <h1 className="text-2xl font-bold text-slate-900">Programmes</h1>
      <p className="mt-1 text-sm text-slate-500">
        Pick a university, then a faculty, to manage its programmes.
      </p>

      <div className="mt-6 flex flex-wrap gap-4">
        <div>
          <label
            htmlFor="universityId"
            className="block text-sm font-medium text-slate-700"
          >
            University
          </label>
          <select
            id="universityId"
            value={universityId}
            onChange={(e) => {
              setUniversityId(e.target.value);
              setFacultyId(""); // parent changed, so the stale child selection must be cleared
            }}
            className="mt-1 w-64 rounded-lg border border-slate-300 px-3 py-2 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">Select a university…</option>
            {universities?.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="facultyId"
            className="block text-sm font-medium text-slate-700"
          >
            Faculty
          </label>
          <select
            id="facultyId"
            value={facultyId}
            onChange={(e) => setFacultyId(e.target.value)}
            disabled={!universityId}
            className="mt-1 w-64 rounded-lg border border-slate-300 px-3 py-2 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-slate-100"
          >
            <option value="">Select a faculty…</option>
            {faculties?.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {facultyId && (
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
                Programme name
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
            <div>
              <label
                htmlFor="studyLevel"
                className="block text-sm font-medium text-slate-700"
              >
                Study level
              </label>
              <select
                id="studyLevel"
                className="mt-1 w-40 rounded-lg border border-slate-300 px-3 py-2 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
                {...register("studyLevel")}
              >
                <option value="">—</option>
                <option value="DIPLOMA">Diploma</option>
                <option value="DEGREE">Degree</option>
                <option value="MASTERS">Masters</option>
                <option value="PHD">PhD</option>
              </select>
            </div>
            <button
              type="submit"
              disabled={isSubmitting || createProgramme.isPending}
              className="rounded-full bg-primary-600 px-5 py-2.5 font-medium text-white hover:bg-primary-700 disabled:opacity-60"
            >
              {createProgramme.isPending ? "Adding…" : "Add programme"}
            </button>
          </form>

          <div className="mt-6 overflow-x-auto rounded-xl border border-slate-200 bg-white">
            {isLoading ? (
              <p className="p-4 text-sm text-slate-500">Loading…</p>
            ) : isError ? (
              <p className="p-4 text-sm text-red-600">
                Could not load programmes.
              </p>
            ) : programmes && programmes.length > 0 ? (
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-500">
                  <tr>
                    <th className="px-4 py-2">Name</th>
                    <th className="px-4 py-2">Level</th>
                    <th className="px-4 py-2">Status</th>
                    <th className="px-4 py-2 text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {programmes.map((p) => (
                    <tr key={p.id} className="border-t border-slate-100">
                      <td className="px-4 py-2 font-medium text-slate-800">
                        {p.name}
                      </td>
                      <td className="px-4 py-2 text-slate-600">
                        {p.studyLevel ?? "—"}
                      </td>
                      <td className="px-4 py-2">
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                            p.isActive
                              ? "bg-green-100 text-green-700"
                              : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          {p.isActive ? "Active" : "Archived"}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-right">
                        <button
                          type="button"
                          onClick={() =>
                            setManageProgrammeId(
                              manageProgrammeId === p.id ? "" : p.id,
                            )
                          }
                          className="mr-3 text-sm font-medium text-primary-700 hover:underline"
                        >
                          {manageProgrammeId === p.id
                            ? "Hide subjects"
                            : "Subjects"}
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setStatus.mutate({
                              id: p.id,
                              isActive: !p.isActive,
                            })
                          }
                          disabled={setStatus.isPending}
                          className="text-sm font-medium text-primary-700 hover:underline disabled:opacity-60"
                        >
                          {p.isActive ? "Archive" : "Restore"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="p-4 text-sm text-slate-500">
                No programmes yet for this faculty — add one above.
              </p>
            )}
          </div>

          {manageProgrammeId && (
            <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4">
              <h3 className="font-semibold text-slate-800">
                Subjects for{" "}
                {programmes?.find((p) => p.id === manageProgrammeId)?.name}
              </h3>
              <p className="mt-0.5 text-sm text-slate-500">
                These are the subjects offered to the subject picker on
                Upload Resource once this programme is selected.
              </p>

              <div className="mt-3 flex flex-wrap items-end gap-3">
                <div>
                  <label
                    htmlFor="subjectToLink"
                    className="block text-sm font-medium text-slate-700"
                  >
                    Add a subject
                  </label>
                  <select
                    id="subjectToLink"
                    value={subjectToLink}
                    onChange={(e) => setSubjectToLink(e.target.value)}
                    className="mt-1 w-64 rounded-lg border border-slate-300 px-3 py-2 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">Select a subject…</option>
                    {allSubjects
                      ?.filter(
                        (s) => !linkedSubjects?.some((ls) => ls.id === s.id),
                      )
                      .map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.code} · {s.name}
                        </option>
                      ))}
                  </select>
                </div>
                <button
                  type="button"
                  disabled={!subjectToLink || linkSubject.isPending}
                  onClick={() =>
                    linkSubject.mutate(
                      { programmeId: manageProgrammeId, subjectId: subjectToLink },
                      { onSuccess: () => setSubjectToLink("") },
                    )
                  }
                  className="rounded-full bg-primary-600 px-5 py-2.5 font-medium text-white hover:bg-primary-700 disabled:opacity-60"
                >
                  {linkSubject.isPending ? "Adding…" : "Link subject"}
                </button>
              </div>

              <ul className="mt-4 flex flex-col gap-2">
                {linkedSubjects && linkedSubjects.length > 0 ? (
                  linkedSubjects.map((s) => (
                    <li
                      key={s.id}
                      className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2 text-sm"
                    >
                      <span>
                        <span className="font-medium text-slate-800">
                          {s.code}
                        </span>{" "}
                        <span className="text-slate-600">{s.name}</span>
                      </span>
                      <button
                        type="button"
                        disabled={unlinkSubject.isPending}
                        onClick={() =>
                          unlinkSubject.mutate({
                            programmeId: manageProgrammeId,
                            subjectId: s.id,
                          })
                        }
                        className="text-sm font-medium text-red-600 hover:underline disabled:opacity-60"
                      >
                        Unlink
                      </button>
                    </li>
                  ))
                ) : (
                  <li className="text-sm text-slate-500">
                    No subjects linked to this programme yet.
                  </li>
                )}
              </ul>
            </div>
          )}
        </>
      )}
    </AdminPageShell>
  );
}
