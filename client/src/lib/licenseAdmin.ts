const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined;
export const DEFAULT_PRODUCT_SLUG = (import.meta.env.VITE_PRODUCT_SLUG as string | undefined) || "wedding-planner-en";

export type AdminLicense = {
  id: string;
  product_slug: string;
  customer_note: string | null;
  max_devices: number;
  active: boolean;
  created_at: string;
  activation_count: number;
  last_seen_at: string | null;
};

type AdminResponse<T> = {
  ok: boolean;
  reason?: string;
  code?: string;
  license?: AdminLicense;
  licenses?: T;
};

async function callAdminRpc<T>(name: string, body: Record<string, unknown>): Promise<AdminResponse<T>> {
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
  return response.json();
}

export function generateLicenseCode(prefix = "WEDDING") {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const part = (size: number) =>
    Array.from({ length: size }, () => alphabet[Math.floor(Math.random() * alphabet.length)]).join("");
  return `${prefix}-${part(4)}-${part(4)}`;
}

export function listAdminLicenses(adminPassword: string, productSlug: string) {
  return callAdminRpc<AdminLicense[]>("admin_list_licenses", {
    p_admin_password: adminPassword,
    p_product_slug: productSlug,
  });
}

export function createAdminLicense(
  adminPassword: string,
  productSlug: string,
  code: string,
  customerNote: string,
  maxDevices: number,
) {
  return callAdminRpc<AdminLicense[]>("admin_create_license", {
    p_admin_password: adminPassword,
    p_product_slug: productSlug,
    p_code: code,
    p_customer_note: customerNote,
    p_max_devices: maxDevices,
  });
}

export function setAdminLicenseStatus(adminPassword: string, licenseId: string, active: boolean) {
  return callAdminRpc<AdminLicense[]>("admin_set_license_status", {
    p_admin_password: adminPassword,
    p_license_id: licenseId,
    p_active: active,
  });
}

