import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  AdminLicense,
  DEFAULT_PRODUCT_SLUG,
  createAdminLicense,
  generateLicenseCode,
  listAdminLicenses,
  setAdminLicenseStatus,
} from "@/lib/licenseAdmin";

const messages: Record<string, string> = {
  invalid_admin_password: "Incorrect administrative password.",
  duplicate_code: "This code already exists. Generate another code and try again.",
  missing_configuration: "Supabase variables have not been configured yet.",
  connection_error: "Could not connect to Supabase right now.",
};

export default function AdminCodigos() {
  const [adminPassword, setAdminPassword] = useState("");
  const [productSlug, setProductSlug] = useState(DEFAULT_PRODUCT_SLUG);
  const [code, setCode] = useState(() => generateLicenseCode());
  const [customerNote, setCustomerNote] = useState("");
  const [maxDevices, setMaxDevices] = useState(2);
  const [licenses, setLicenses] = useState<AdminLicense[]>([]);
  const [message, setMessage] = useState("");
  const [createdCode, setCreatedCode] = useState("");
  const [loading, setLoading] = useState(false);

  const activeCount = useMemo(() => licenses.filter(item => item.active).length, [licenses]);

  async function refresh() {
    if (!adminPassword.trim()) return;
    setLoading(true);
    setMessage("");
    const result = await listAdminLicenses(adminPassword, productSlug.trim());
    setLoading(false);
    if (result.ok) {
      setLicenses(result.licenses || []);
      return;
    }
    setMessage(messages[result.reason || ""] || "Could not load access codes.");
  }

  useEffect(() => {
    if (!adminPassword.trim()) return;
    const id = window.setTimeout(() => refresh(), 350);
    return () => window.clearTimeout(id);
  }, [productSlug]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!adminPassword.trim() || !code.trim() || !productSlug.trim()) return;

    setLoading(true);
    setMessage("");
    setCreatedCode("");
    const result = await createAdminLicense(
      adminPassword,
      productSlug.trim(),
      code.trim().toUpperCase(),
      customerNote.trim(),
      maxDevices,
    );
    setLoading(false);

    if (!result.ok) {
      setMessage(messages[result.reason || ""] || "Could not create access code.");
      return;
    }

    setCreatedCode(result.code || code.trim().toUpperCase());
    setCustomerNote("");
    setCode(generateLicenseCode());
    await refresh();
  }

  async function toggleLicense(item: AdminLicense) {
    setLoading(true);
    setMessage("");
    const result = await setAdminLicenseStatus(adminPassword, item.id, !item.active);
    setLoading(false);
    if (!result.ok) {
      setMessage(messages[result.reason || ""] || "Could not update access code.");
      return;
    }
    await refresh();
  }

  return (
    <main className="admin-page">
      <section className="admin-hero">
        <span>KAWAII PLANNER</span>
        <h1>License Key Panel</h1>
        <p>Create and track customer access codes without opening Supabase SQL.</p>
      </section>

      <section className="admin-grid">
        <form className="admin-card" onSubmit={submit}>
          <h2>New License Key</h2>
          <label>
            Administrative Password
            <input
              type="password"
              value={adminPassword}
              onChange={event => setAdminPassword(event.target.value)}
              placeholder="Your panel password"
            />
          </label>
          <label>
            Product Version
            <select
              value={productSlug}
              onChange={event => setProductSlug(event.target.value)}
              style={{
                width: "100%",
                border: "2px solid #ead1c2",
                borderRadius: "14px",
                background: "#fff5f8",
                color: "#653a32",
                padding: "0.85rem 0.95rem",
                font: "900 1rem Nunito, sans-serif",
                outline: "none",
                cursor: "pointer"
              }}
            >
              <option value="planner-app-cherry-en">English (planner-app-cherry-en)</option>
              <option value="planner-app-cherry">Portuguese (planner-app-cherry)</option>
            </select>
          </label>
          <label>
            Customer Access Code
            <div className="admin-inline">
              <input value={code} onChange={event => setCode(event.target.value.toUpperCase())} />
              <button type="button" onClick={() => setCode(generateLicenseCode())}>Generate</button>
            </div>
          </label>
          <label>
            Order / Customer Note
            <input
              value={customerNote}
              onChange={event => setCustomerNote(event.target.value)}
              placeholder="e.g. Etsy Order 1024 - Emily"
            />
          </label>
          <label>
            Allowed Devices
            <input
              type="number"
              min={1}
              max={10}
              value={maxDevices}
              onChange={event => setMaxDevices(Number(event.target.value))}
            />
          </label>
          <button className="admin-primary" type="submit" disabled={loading}>
            {loading ? "Saving..." : "Create Code"}
          </button>
          <button className="admin-secondary" type="button" onClick={refresh} disabled={loading || !adminPassword.trim()}>
            Update List
          </button>
          {createdCode && (
            <div className="admin-success">
              Key created:
              <strong>{createdCode}</strong>
              <button type="button" onClick={() => navigator.clipboard.writeText(createdCode)}>Copy</button>
            </div>
          )}
          {message && <p className="admin-error">{message}</p>}
        </form>

        <div className="admin-card admin-list">
          <div className="admin-list-head">
            <div>
              <h2>Generated Keys</h2>
              <p>{licenses.length} in total, {activeCount} active</p>
            </div>
            <button type="button" onClick={refresh} disabled={loading || !adminPassword.trim()}>Reload</button>
          </div>

          <div className="admin-table">
            {licenses.length === 0 ? (
              <div className="admin-empty">Enter password and click reload/update list to view keys.</div>
            ) : (
              licenses.map(item => (
                <article key={item.id} className="admin-row">
                  <div>
                    <strong>{item.customer_note || "No description"}</strong>
                    <span>{item.product_slug}</span>
                    <small>Created on {new Date(item.created_at).toLocaleDateString("en-US")}</small>
                  </div>
                  <div className="admin-metrics">
                    <span>{item.activation_count}/{item.max_devices} uses</span>
                    <span className={item.active ? "active" : "inactive"}>{item.active ? "Active" : "Disabled"}</span>
                    <button type="button" onClick={() => toggleLicense(item)}>
                      {item.active ? "Disable" : "Enable"}
                    </button>
                  </div>
                </article>
              ))
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
