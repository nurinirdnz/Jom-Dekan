import { useEffect, useRef, useState } from "react";
import * as pdfjsLib from "pdfjs-dist";
import pdfjsWorkerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url";
import { FileText } from "lucide-react";

// Configured once at module load, not per-render.
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorkerUrl;

/**
 * Renders a PDF's first page into a <canvas> as a real visual thumbnail
 * — fetched from the same signed preview URL images already use, just
 * decoded client-side instead of shown via <img>. Falls back to a plain
 * file icon if the PDF fails to load/render (e.g. a stale/expired URL).
 */
export function PdfThumbnail({ url, className }: { url: string; className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");

  useEffect(() => {
    let cancelled = false;
    let renderTask: ReturnType<
      Awaited<ReturnType<Awaited<ReturnType<typeof pdfjsLib.getDocument>["promise"]>["getPage"]>>["render"]
    > | null = null;
    setStatus("loading");

    (async () => {
      try {
        const pdf = await pdfjsLib.getDocument({ url }).promise;
        if (cancelled) return;
        const page = await pdf.getPage(1);
        if (cancelled) return;

        const targetWidth = 500;
        const baseViewport = page.getViewport({ scale: 1 });
        const scale = targetWidth / baseViewport.width;
        const viewport = page.getViewport({ scale });

        const canvas = canvasRef.current;
        if (!canvas || cancelled) return;
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const context = canvas.getContext("2d");
        if (!context) return;

        renderTask = page.render({ canvasContext: context, viewport, canvas });
        await renderTask.promise;
        if (!cancelled) setStatus("ready");
      } catch {
        if (!cancelled) setStatus("error");
      }
    })();

    return () => {
      cancelled = true;
      renderTask?.cancel();
    };
  }, [url]);

  if (status === "error") {
    return <FileText className="h-10 w-10 text-slate-300" aria-hidden="true" />;
  }

  return (
    <>
      {status === "loading" && <div className="h-full w-full animate-pulse bg-slate-200" />}
      <canvas ref={canvasRef} className={status === "ready" ? className : "hidden"} />
    </>
  );
}
