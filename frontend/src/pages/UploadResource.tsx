import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { ArrowLeft, FileText, ClipboardList, Presentation, Newspaper, FileSpreadsheet, UploadCloud, X } from "lucide-react";
import {
  uploadResourceFormSchema,
  type UploadResourceFormValues,
} from "../schemas/resourceSchemas";
import { useUploadResource } from "../hooks/useResources";
import {
  useUniversities,
  useFaculties,
  useProgrammes,
  useSubjects,
} from "../hooks/useTaxonomy";
import { useMyProfile } from "../hooks/useProfile";
import { SearchableSelect } from "../components/common/SearchableSelect";
import { RESOURCE_CATEGORIES, RESOURCE_CATEGORY_LABELS, type ResourceCategory } from "../types/resource";

const CATEGORY_ICON: Record<ResourceCategory, typeof FileText> = {
  PAST_PAPER: FileText,
  NOTES: ClipboardList,
  SLIDES: Presentation,
  ARTICLE: Newspaper,
  EXCEL: FileSpreadsheet,
};

export default function UploadResource() {
  const navigate = useNavigate();
  const uploadResource = useUploadResource();
  const { data: profile } = useMyProfile();
  const [progress, setProgress] = useState(0);
  const { data: universities } = useUniversities();
  const [universityId, setUniversityId] = useState("");
  const [facultyId, setFacultyId] = useState("");
  const [programmeId, setProgrammeId] = useState("");
  const { data: faculties } = useFaculties(universityId || undefined);
  const { data: programmes } = useProgrammes(facultyId || undefined);
  const { data: subjects } = useSubjects(programmeId || undefined);
  const [fileName, setFileName] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<UploadResourceFormValues>({
    resolver: zodResolver(uploadResourceFormSchema),
  });

  const category = watch("category");
  const hasFile = Boolean(watch("file"));

  const onSubmit = (values: UploadResourceFormValues) => {
    setProgress(0);
    uploadResource.mutate(
      {
        title: values.title,
        description: values.description,
        category: values.category as ResourceCategory,
        universityId,
        facultyId,
        programmeId,
        subjectId: values.subjectId,
        file: values.file,
        onProgress: setProgress,
      },
      {
        onSuccess: (result) => navigate(`/resources/${result.resource.id}`),
      },
    );
  };

  const serverError =
    uploadResource.isError && axios.isAxiosError(uploadResource.error)
      ? (
          uploadResource.error.response?.data as {
            error?: { message?: string };
          }
        )?.error?.message
      : null;

  return (
    <div className="mx-auto max-w-6xl px-[18px] py-[22px] motion-safe:animate-[fadeIn_300ms_ease-out]">
      <h1 className="text-2xl font-bold text-slate-900">Upload a resource</h1>
      <p className="mt-1 text-sm text-slate-500">
        Choose a category and either attach a file (PDF, Word, Excel, PowerPoint, JPEG, or PNG, up to 20MB) or write the content directly as
        text. Every file is checked by its actual content before it&apos;s accepted — not just its name or extension.
      </p>

      {profile && (
        <div className="mt-4 rounded-xl border border-[#ECEBF7] bg-[#FBFBFE] px-4 py-3 text-sm text-slate-600">
          <p className="font-medium text-slate-800">Uploading as</p>
          <p className="mt-0.5">
            {profile.displayName}
            {profile.university?.name && <> · {profile.university.name}</>}
            {profile.fieldOfStudy && <> · {profile.fieldOfStudy}</>}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Your name and institution are attached to every resource you upload and stay visible to other users. Only
            upload material you have the right to share.
          </p>
        </div>
      )}

      <form
        className="mt-6 flex flex-col gap-5 rounded-[22px] border border-[#ECEBF7] bg-white p-6 shadow-sm"
        onSubmit={handleSubmit(onSubmit)}
        noValidate
      >
        {serverError && (
          <div
            role="alert"
            className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700 motion-safe:animate-[fadeIn_200ms_ease-out]"
          >
            {serverError}
          </div>
        )}

        <div>
          <label htmlFor="title" className="block text-sm font-bold text-slate-700">
            Title<span className="text-red-500"> *</span>
          </label>
          <input
            id="title"
            className="mt-1.5 w-full rounded-xl border border-[#E4E3F2] bg-[#FBFBFE] px-3 py-2.5 text-sm text-slate-700 transition motion-safe:duration-150 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
            aria-invalid={Boolean(errors.title)}
            {...register("title")}
          />
          {errors.title && (
            <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
          )}
        </div>

        <div>
          <span className="block text-sm font-bold text-slate-700">
            Category<span className="text-red-500"> *</span>
          </span>
          <p className="mt-0.5 text-xs text-slate-500">Pick one — this shows on the resource card and can be filtered on.</p>
          <div className="mt-2.5 grid grid-cols-2 gap-2 sm:grid-cols-3">
            {RESOURCE_CATEGORIES.map((c) => {
              const Icon = CATEGORY_ICON[c];
              const active = category === c;
              return (
                <button
                  key={c}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setValue("category", c, { shouldValidate: true })}
                  className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-bold transition motion-safe:duration-150 ${
                    active
                      ? "border-primary-500 bg-primary-50 text-primary-700"
                      : "border-[#E4E3F2] text-slate-600 hover:-translate-y-0.5 hover:border-primary-200"
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                  {RESOURCE_CATEGORY_LABELS[c]}
                </button>
              );
            })}
          </div>
          {errors.category && (
            <p className="mt-1 text-sm text-red-600">{errors.category.message as string}</p>
          )}
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label htmlFor="universityId" className="block text-sm font-bold text-slate-700">
              University
            </label>
            <SearchableSelect
              id="universityId"
              options={(universities ?? [])
                .filter((item) => item.isActive)
                .map((item) => ({ value: item.id, label: item.name }))}
              value={universityId}
              onChange={(value) => {
                setUniversityId(value);
                setFacultyId("");
                setProgrammeId("");
                setValue("facultyId", "");
                setValue("programmeId", "");
                setValue("subjectId", "");
              }}
              placeholder="Search for a university…"
            />
          </div>
          <div>
            <label htmlFor="facultyId" className="block text-sm font-bold text-slate-700">
              Faculty
            </label>
            <SearchableSelect
              id="facultyId"
              options={(faculties ?? [])
                .filter((item) => item.isActive)
                .map((item) => ({ value: item.id, label: item.name }))}
              value={facultyId}
              onChange={(value) => {
                setFacultyId(value);
                setProgrammeId("");
                setValue("programmeId", "");
                setValue("subjectId", "");
              }}
              disabled={!universityId}
              placeholder={universityId ? "Search for a faculty…" : "Select a university first"}
            />
          </div>
          <div>
            <label htmlFor="programmeId" className="block text-sm font-bold text-slate-700">
              Programme
            </label>
            <SearchableSelect
              id="programmeId"
              options={(programmes ?? [])
                .filter((item) => item.isActive)
                .map((item) => ({ value: item.id, label: item.name }))}
              value={programmeId}
              onChange={(value) => {
                setProgrammeId(value);
                setValue("subjectId", "");
              }}
              disabled={!facultyId}
              placeholder={facultyId ? "Search for a programme…" : "Select a faculty first"}
            />
          </div>
          <div>
            <label htmlFor="subjectId" className="block text-sm font-bold text-slate-700">
              Subject
            </label>
            <Controller
              control={control}
              name="subjectId"
              render={({ field }) => (
                <SearchableSelect
                  id="subjectId"
                  options={(subjects ?? [])
                    .filter((item) => item.isActive)
                    .map((item) => ({ value: item.id, label: `${item.code} · ${item.name}` }))}
                  value={field.value ?? ""}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  disabled={!programmeId}
                  placeholder={programmeId ? "Search for a subject…" : "Select a programme first"}
                />
              )}
            />
            {programmeId && subjects && subjects.length === 0 && (
              <p className="mt-1 text-xs text-slate-500">
                No subjects are linked to this programme yet.
              </p>
            )}
          </div>
        </div>

        <div>
          <label htmlFor="file" className="block text-sm font-bold text-slate-700">
            File <span className="font-semibold text-slate-400">· optional</span>
          </label>
          <p className="mt-0.5 text-xs text-slate-500">
            Leave this empty to post as text instead — write the content in the description field below.
          </p>
          <Controller
            control={control}
            name="file"
            render={({ field: { onChange, onBlur, ref } }) => (
              <label
                htmlFor="file"
                className="mt-2 flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 border-dashed border-[#E4E3F2] bg-[#FBFBFE] px-4 py-6 text-center transition motion-safe:duration-150 hover:border-primary-300 hover:bg-primary-50/40"
              >
                <UploadCloud className="h-6 w-6 text-primary-500" aria-hidden="true" />
                <span className="text-sm font-semibold text-slate-700">
                  {fileName ? fileName : "Click to choose a file"}
                </span>
                <span className="text-xs text-slate-400">PDF, Word, Excel, PowerPoint, JPEG, or PNG — up to 20MB</span>
                <input
                  id="file"
                  type="file"
                  accept="application/pdf,image/jpeg,image/png,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.openxmlformats-officedocument.presentationml.presentation"
                  ref={ref}
                  onBlur={onBlur}
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    onChange(f);
                    setFileName(f?.name ?? null);
                  }}
                  className="sr-only"
                />
              </label>
            )}
          />
          {fileName && (
            <button
              type="button"
              onClick={() => {
                setValue("file", undefined);
                setFileName(null);
              }}
              className="mt-2 flex items-center gap-1.5 text-xs font-bold text-slate-500 transition motion-safe:duration-150 hover:text-red-600"
            >
              <X className="h-3.5 w-3.5" aria-hidden="true" />
              Remove file
            </button>
          )}
          {errors.file && (
            <p className="mt-1 text-sm text-red-600">
              {errors.file.message as string}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-bold text-slate-700">
            Description {hasFile ? <span className="font-semibold text-slate-400">· optional</span> : <span className="text-red-500">*</span>}
          </label>
          {!hasFile && (
            <p className="mt-0.5 text-xs text-slate-500">No file attached — this text is the resource&apos;s content (at least 20 characters).</p>
          )}
          <textarea
            id="description"
            rows={hasFile ? 3 : 6}
            className="mt-1.5 w-full resize-y rounded-xl border border-[#E4E3F2] bg-[#FBFBFE] px-3 py-2.5 text-sm text-slate-700 transition motion-safe:duration-150 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
            {...register("description")}
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
          )}
        </div>

        {uploadResource.isPending && hasFile && (
          <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full bg-primary-600 transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting || uploadResource.isPending}
          className="rounded-full bg-primary-600 px-5 py-2.5 font-bold text-white transition motion-safe:duration-150 hover:-translate-y-0.5 hover:bg-primary-700 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
        >
          {uploadResource.isPending ? (hasFile ? `Uploading… ${progress}%` : "Posting…") : "Upload"}
        </button>
      </form>

      <button
        type="button"
        onClick={() => navigate(-1)}
        className="mt-5 flex items-center gap-1.5 text-sm font-bold text-slate-500 transition motion-safe:duration-150 hover:-translate-x-0.5 hover:text-primary-700"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Back
      </button>
    </div>
  );
}
