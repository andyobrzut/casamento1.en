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
  invalid_admin_password: "Senha administrativa incorreta.",
  duplicate_code: "Este código já existe. Gere outro código e tente novamente.",
  missing_configuration: "As variáveis do Supabase ainda não foram configuradas.",
  connection_error: "Não foi possível conectar ao Supabase agora.",
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
    setMessage(messages[result.reason || ""] || "Não foi possível carregar os códigos.");
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
      setMessage(messages[result.reason || ""] || "Não foi possível criar o código.");
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
      setMessage(messages[result.reason || ""] || "Não foi possível atualizar o código.");
      return;
    }
    await refresh();
  }

  return (
    <main className="admin-page">
      <section className="admin-hero">
        <span>PLANNER KAWAII</span>
        <h1>Painel de códigos</h1>
        <p>Crie e acompanhe códigos de acesso para clientes sem abrir o SQL do Supabase.</p>
      </section>

      <section className="admin-grid">
        <form className="admin-card" onSubmit={submit}>
          <h2>Novo código</h2>
          <label>
            Senha administrativa
            <input
              type="password"
              value={adminPassword}
              onChange={event => setAdminPassword(event.target.value)}
              placeholder="Sua senha do painel"
            />
          </label>
          <label>
            Produto
            <input value={productSlug} onChange={event => setProductSlug(event.target.value)} />
          </label>
          <label>
            Código para a cliente
            <div className="admin-inline">
              <input value={code} onChange={event => setCode(event.target.value.toUpperCase())} />
              <button type="button" onClick={() => setCode(generateLicenseCode())}>Gerar</button>
            </div>
          </label>
          <label>
            Pedido / cliente
            <input
              value={customerNote}
              onChange={event => setCustomerNote(event.target.value)}
              placeholder="Ex.: Pedido Etsy 1024 - Maria"
            />
          </label>
          <label>
            Dispositivos liberados
            <input
              type="number"
              min={1}
              max={10}
              value={maxDevices}
              onChange={event => setMaxDevices(Number(event.target.value))}
            />
          </label>
          <button className="admin-primary" type="submit" disabled={loading}>
            {loading ? "Salvando..." : "Criar código"}
          </button>
          <button className="admin-secondary" type="button" onClick={refresh} disabled={loading || !adminPassword.trim()}>
            Atualizar lista
          </button>
          {createdCode && (
            <div className="admin-success">
              Código criado:
              <strong>{createdCode}</strong>
              <button type="button" onClick={() => navigator.clipboard.writeText(createdCode)}>Copiar</button>
            </div>
          )}
          {message && <p className="admin-error">{message}</p>}
        </form>

        <div className="admin-card admin-list">
          <div className="admin-list-head">
            <div>
              <h2>Códigos criados</h2>
              <p>{licenses.length} no total, {activeCount} ativos</p>
            </div>
            <button type="button" onClick={refresh} disabled={loading || !adminPassword.trim()}>Recarregar</button>
          </div>

          <div className="admin-table">
            {licenses.length === 0 ? (
              <div className="admin-empty">Digite a senha e clique em atualizar para ver os códigos.</div>
            ) : (
              licenses.map(item => (
                <article key={item.id} className="admin-row">
                  <div>
                    <strong>{item.customer_note || "Sem anotação"}</strong>
                    <span>{item.product_slug}</span>
                    <small>Criado em {new Date(item.created_at).toLocaleDateString("pt-BR")}</small>
                  </div>
                  <div className="admin-metrics">
                    <span>{item.activation_count}/{item.max_devices} usos</span>
                    <span className={item.active ? "active" : "inactive"}>{item.active ? "Ativo" : "Desativado"}</span>
                    <button type="button" onClick={() => toggleLicense(item)}>
                      {item.active ? "Desativar" : "Ativar"}
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
