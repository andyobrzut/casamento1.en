const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined;
const WEDDING_PRODUCT_SLUG = "wedding-planner-en";
const configuredSlug = (import.meta.env.VITE_PRODUCT_SLUG as string | undefined)?.trim();
// Vercel had planner-wedding-en — codes in painel use wedding-planner-en
const PRODUCT_SLUG =
  !configuredSlug || configuredSlug === "planner-wedding-en"
    ? WEDDING_PRODUCT_SLUG
    : configuredSlug;

const DEVICE_KEY = "wedding_planner_en_device_id";
const ACTIVATION_KEY = "wedding_planner_en_activation_id";

function readStoredValue(key: string) {
  try {
    return window.localStorage.getItem(key) || window.sessionStorage.getItem(key);
  } catch {
    return window.sessionStorage.getItem(key);
  }
}

function writeStoredValue(key: string, value: string) {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Safari private mode and some mobile browsers block localStorage.
  }
  window.sessionStorage.setItem(key, value);
}

function removeStoredValue(key: string) {
  try {
    window.localStorage.removeItem(key);
  } catch {
    // Ignore storage cleanup errors.
  }
  window.sessionStorage.removeItem(key);
}

function normalizeActivationCode(code: string) {
  return code
    .trim()
    .toUpperCase()
    .replace(/[\u2010-\u2015\u2212\uFE58\uFE63\uFF0D]/g, "-")
    .replace(/\s+/g, "")
    .replace(/[^A-Z0-9-]/g, "");
}

export type ActivationResult = {
  ok: boolean;
  reason?: string;
  activation_id?: string;
};

export const ACTIVE_PRODUCT_SLUG = PRODUCT_SLUG;

export function activationIsConfigured() {
  return Boolean(SUPABASE_URL && PUBLISHABLE_KEY);
}

export function getDeviceId() {
  let deviceId = readStoredValue(DEVICE_KEY);
  if (!deviceId) {
    deviceId = crypto.randomUUID();
    writeStoredValue(DEVICE_KEY, deviceId);
  }
  return deviceId;
}

async function callActivationRpc(name: string, body: Record<string, string>): Promise<ActivationResult> {
  if (!SUPABASE_URL || !PUBLISHABLE_KEY) {
    return { ok: false, reason: "missing_configuration" };
  }

  const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/${name}`, {
    method: "POST",
    headers: {
      apikey: PUBLISHABLE_KEY,
      Authorization: `Bearer ${PUBLISHABLE_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) return { ok: false, reason: "connection_error" };
  const data = (await response.json()) as ActivationResult;
  return { ...data, ok: Boolean(data.ok) };
}

export async function activateLicense(code: string) {
  const normalizedCode = normalizeActivationCode(code);
  const result = await callActivationRpc("activate_license", {
    p_code: normalizedCode,
    p_device_id: getDeviceId(),
    p_product_slug: PRODUCT_SLUG,
  });

  if (result.ok) {
    if (result.activation_id) {
      writeStoredValue(ACTIVATION_KEY, result.activation_id);
    }
  }
  return result;
}

export async function verifyActivation() {
  const activationId = readStoredValue(ACTIVATION_KEY);
  if (!activationId) return { ok: false, reason: "not_activated" };

  const result = await callActivationRpc("verify_activation", {
    p_activation_id: activationId,
    p_device_id: getDeviceId(),
    p_product_slug: PRODUCT_SLUG,
  });

  if (!result.ok) removeStoredValue(ACTIVATION_KEY);
  return result;
}

