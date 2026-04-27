import type { Bundle, Item, AppConfig } from "../types";
import type { TrackerState } from "../store/trackerSlice";

// ── Export types ─────────────────────────────────────────────

export interface ExportData {
  bundles: Bundle[];
  items: Item[];
  config: AppConfig;
  exportedAt: string;
}

const projectName = process.env.NEXT_PUBLIC_APP_NAME ?? "tracker";

// ── JSON export ───────────────────────────────────────────────

export function exportJSON(state: TrackerState): void {
  const data: ExportData = {
    bundles: state.bundles,
    items: state.items,
    config: state.config,
    exportedAt: new Date().toISOString(),
  };

  triggerDownload(
    new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }),
    `${projectName}-backup-${today()}.json`,
  );
}

// ── JSON import ───────────────────────────────────────────────

export type ImportMode = "replace" | "merge";

export interface ImportResult {
  ok: boolean;
  error?: string;
  data?: ExportData;
}

export function parseImportFile(file: File): Promise<ImportResult> {
  return new Promise((resolve) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const parsed = JSON.parse(e.target?.result as string);

        if (!Array.isArray(parsed.bundles) || !Array.isArray(parsed.items)) {
          resolve({ ok: false, error: "Invalid file — missing bundles or items." });
          return;
        }

        resolve({
          ok: true,
          data: {
            bundles: parsed.bundles,
            items: parsed.items,
            config: parsed.config ?? null,
            exportedAt: parsed.exportedAt ?? "",
          },
        });
      } catch {
        resolve({ ok: false, error: "Could not parse file. Make sure it's a valid JSON backup." });
      }
    };

    reader.onerror = () => resolve({ ok: false, error: "Failed to read file." });
    reader.readAsText(file);
  });
}

// ── Wipe ─────────────────────────────────────────────────────

export function clearAllData(): void {
  localStorage.clear();
  window.location.reload();
}

// ── Helpers ──────────────────────────────────────────────────

function triggerDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}
