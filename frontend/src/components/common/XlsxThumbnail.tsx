import { useEffect, useState } from "react";
import { FileSpreadsheet } from "lucide-react";

const PREVIEW_ROWS = 6;
const PREVIEW_COLS = 5;

/**
 * Renders the first few rows of a spreadsheet's first sheet as a small
 * table — fetched from the same signed preview URL PDFs use. Falls back
 * to a spreadsheet icon if the file fails to load/parse.
 */
export function XlsxThumbnail({ url }: { url: string }) {
  const [rows, setRows] = useState<string[][] | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">(
    "loading",
  );

  useEffect(() => {
    const controller = new AbortController();
    setStatus("loading");

    (async () => {
      try {
        const res = await fetch(url, { signal: controller.signal });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const buffer = await res.arrayBuffer();

        // Loaded on demand so the parser isn't in the main bundle for
        // users who never see a spreadsheet card.
        const XLSX = await import("xlsx");
        const workbook = XLSX.read(buffer, {
          type: "array",
          sheetRows: PREVIEW_ROWS,
        });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        if (!sheet) throw new Error("Workbook has no sheets");

        const data = XLSX.utils.sheet_to_json<unknown[]>(sheet, {
          header: 1,
          defval: "",
        });
        const trimmed = data
          .slice(0, PREVIEW_ROWS)
          .map((row) => row.slice(0, PREVIEW_COLS).map((cell) => String(cell)));

        if (!controller.signal.aborted) {
          setRows(trimmed);
          setStatus("ready");
        }
      } catch (err) {
        if (controller.signal.aborted) return;
        console.warn("XLSX thumbnail failed:", url, err);
        setStatus("error");
      }
    })();

    return () => controller.abort();
  }, [url]);

  if (status === "error" || (status === "ready" && !rows?.length)) {
    return (
      <FileSpreadsheet
        className="h-10 w-10 text-slate-300"
        aria-hidden="true"
      />
    );
  }

  if (status === "loading") {
    return <div className="h-full w-full animate-pulse bg-slate-200" />;
  }

  return (
    <div
      className="h-full w-full overflow-hidden bg-white p-3"
      aria-hidden="true"
    >
      <table className="w-full table-fixed border-collapse text-[10px] text-slate-600">
        <tbody>
          {rows!.map((row, r) => (
            <tr
              key={r}
              className={
                r === 0 ? "bg-emerald-50 font-semibold text-slate-700" : ""
              }
            >
              {row.map((cell, c) => (
                <td
                  key={c}
                  className="truncate border border-slate-200 px-1.5 py-1"
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
