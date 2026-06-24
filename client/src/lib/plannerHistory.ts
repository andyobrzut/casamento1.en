export const PLANNER_HISTORY_KEY = "planner_history_periods";

export type PlannerPeriod = {
  id: string;
  name: string;
  createdAt: string;
  data: Record<string, string>;
};

type PlannerBackup = {
  product: "capybara-planner-en";
  version: 1;
  exportedAt: string;
  data: Record<string, string>;
};

function getPlannerKeys(includeHistory = false) {
  return Object.keys(window.localStorage).filter(
    key => key.startsWith("planner_") && (includeHistory || key !== PLANNER_HISTORY_KEY),
  );
}

function capturePlannerData(includeHistory = false) {
  return Object.fromEntries(
    getPlannerKeys(includeHistory).map(key => [key, window.localStorage.getItem(key) || "null"]),
  );
}

export function getPlannerHistory(): PlannerPeriod[] {
  try {
    const history = JSON.parse(window.localStorage.getItem(PLANNER_HISTORY_KEY) || "[]");
    return Array.isArray(history) ? history : [];
  } catch {
    return [];
  }
}

export function savePlannerPeriod(name: string): PlannerPeriod[] {
  const period: PlannerPeriod = {
    id: crypto.randomUUID(),
    name: name.trim(),
    createdAt: new Date().toISOString(),
    data: capturePlannerData(),
  };
  const history = [period, ...getPlannerHistory()];
  window.localStorage.setItem(PLANNER_HISTORY_KEY, JSON.stringify(history));
  return history;
}

export function clearCurrentPlanner() {
  getPlannerKeys().forEach(key => window.localStorage.removeItem(key));
}

export function restorePlannerPeriod(period: PlannerPeriod) {
  clearCurrentPlanner();
  Object.entries(period.data).forEach(([key, value]) => window.localStorage.setItem(key, value));
}

export function deletePlannerPeriod(id: string): PlannerPeriod[] {
  const history = getPlannerHistory().filter(period => period.id !== id);
  window.localStorage.setItem(PLANNER_HISTORY_KEY, JSON.stringify(history));
  return history;
}

export function downloadPlannerBackup() {
  const backup: PlannerBackup = {
    product: "capybara-planner-en",
    version: 1,
    exportedAt: new Date().toISOString(),
    data: capturePlannerData(true),
  };
  const date = new Date().toISOString().slice(0, 10);
  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `capybara-planner-backup-${date}.json`;
  link.click();
  URL.revokeObjectURL(url);
}

export async function importPlannerBackup(file: File) {
  const backup = JSON.parse(await file.text()) as Partial<PlannerBackup>;
  if (
    backup.product !== "capybara-planner-en" ||
    backup.version !== 1 ||
    !backup.data ||
    typeof backup.data !== "object"
  ) {
    throw new Error("This file is not a valid Capybara Planner backup.");
  }

  const entries = Object.entries(backup.data);
  if (entries.some(([key, value]) => !key.startsWith("planner_") || typeof value !== "string")) {
    throw new Error("This backup contains invalid planner data.");
  }

  getPlannerKeys(true).forEach(key => window.localStorage.removeItem(key));
  entries.forEach(([key, value]) => window.localStorage.setItem(key, value));
}
