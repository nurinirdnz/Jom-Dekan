import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { uploadResourceFormSchema, type UploadResourceFormValues } from "../schemas/resourceSchemas";
import { useUploadResource } from "../hooks/useResources";

export default function UploadResource() {
  const navigate = useNavigate();
  const uploadResource = useUploadResource();
  const [progress, setProgress] = useState(0);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<UploadResourceFormValues>({
    resolver: zodResolver(uploadResourceFormSchema),
  });

  const onSubmit = (values: UploadResourceFormValues) => {
    setProgress(0);
    uploadResource.mutate(
      {
        title: values.title,
        description: values.description,
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
      ? (uploadResource.error.response?.data as { error?: { message?: string } })?.error?.message
      : null;

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-2xl font-bold text-slate-900">Upload a resource</h1>
      <p className="mt-1 text-sm text-slate-500">
        PDF, JPEG, or PNG only, up to 20MB. Every file is checked by its actual content before it's accepted — not
        just its name or extension.
      </p>

      <form
        className="mt-6 flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-6"
        onSubmit={handleSubmit(onSubmit)}
        noValidate
      >
        {serverError && (
          <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
            {serverError}
          </div>
        )}

        <div>
          <label htmlFor="title" className="block text-sm font-medium text-slate-700">
            Title
          </label>
          <input
            id="title"
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
            aria-invalid={Boolean(errors.title)}
            {...register("title")}
          />
          {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>}
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-slate-700">
            Description (optional)
          </label>
          <textarea
            id="description"
            rows={3}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
            {...register("description")}
          />
        </div>

        <div>
          <label htmlFor="file" className="block text-sm font-medium text-slate-700">
            File
          </label>
          <Controller
            control={control}
            name="file"
            render={({ field: { onChange, onBlur, ref } }) => (
              <input
                id="file"
                type="file"
                accept="application/pdf,image/jpeg,image/png"
                ref={ref}
                onBlur={onBlur}
                onChange={(e) => onChange(e.target.files?.[0])}
                className="mt-1 block w-full text-sm text-slate-600 file:mr-4 file:rounded-full file:border-0 file:bg-primary-50 file:px-4 file:py-2 file:text-sm file:font-medium file:text-primary-700 hover:file:bg-primary-100"
              />
            )}
          />
          {errors.file && <p className="mt-1 text-sm text-red-600">{errors.file.message as string}</p>}
        </div>

        {uploadResource.isPending && (
          <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
            <div className="h-full bg-primary-600 transition-all" style={{ width: `${progress}%` }} />
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting || uploadResource.isPending}
          className="rounded-full bg-primary-600 px-5 py-2.5 font-medium text-white hover:bg-primary-700 disabled:opacity-60"
        >
          {uploadResource.isPending ? `Uploading… ${progress}%` : "Upload"}
        </button>
      </form>
    </div>
  );
}
