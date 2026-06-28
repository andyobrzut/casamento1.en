import { FormEvent, ReactNode, useEffect, useState } from "react";
import { activateLicense, activationIsConfigured, verifyActivation } from "@/lib/activation";

const messages: Record<string, string> = {
  invalid_code: "Invalid code. Please check the code you received after purchase.",
  expired_code: "This code has expired. Please contact the shop.",
  disabled_code: "This code has been disabled. Please contact the shop.",
  device_limit: "This code has already reached the device limit.",
  connection_error: "We could not validate the code right now. Check your connection and try again.",
  missing_configuration: "Activation is not configured for this app yet.",
};

export default function ActivationGate({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<"checking" | "locked" | "unlocked">("checking");
  const [code, setCode] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const isAdminPage = ["/painel-codigos", "/admin-codigos"].includes(window.location.pathname);

  useEffect(() => {
    if (isAdminPage) {
      setStatus("unlocked");
      return;
    }
    if (!activationIsConfigured()) {
      setStatus("locked");
      setMessage(messages.missing_configuration);
      return;
    }

    let cancelled = false;
    const timeout = window.setTimeout(() => {
      if (!cancelled) setStatus(current => (current === "checking" ? "locked" : current));
    }, 2500);

    verifyActivation()
      .then(result => {
        if (cancelled) return;
        setStatus(result.ok ? "unlocked" : "locked");
      })
      .catch(() => {
        if (cancelled) return;
        setStatus("locked");
        setMessage(messages.connection_error);
      })
      .finally(() => window.clearTimeout(timeout));

    return () => {
      cancelled = true;
      window.clearTimeout(timeout);
    };
  }, [isAdminPage]);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!code.trim()) return;
    setLoading(true);
    setMessage("");
    try {
      const result = await activateLicense(code);
      if (result.ok) {
        setStatus("unlocked");
        return;
      }
      setMessage(messages[result.reason || ""] || "We could not activate this code.");
    } catch {
      setMessage(messages.connection_error);
    } finally {
      setLoading(false);
    }
  };

  if (status === "unlocked") return children;

  return (
    <main className="activation-page">
      <section className="activation-panel">
        <div className="activation-art" aria-hidden="true" />
        <div className="activation-content">
          <span className="activation-badge">WEDDING PLANNER</span>
          <h1>{status === "checking" ? "Checking access..." : "Activate your wedding planner"}</h1>
          <p>Enter the code sent by the shop after purchase to unlock this device.</p>
          {status !== "unlocked" && (
            <form onSubmit={submit}>
              <label htmlFor="activation-code">Access code</label>
              <input
                id="activation-code"
                value={code}
                onChange={event => setCode(event.target.value.toUpperCase())}
                placeholder="WEDDING-XXXX-XXXX"
                autoComplete="one-time-code"
                maxLength={40}
                disabled={status === "checking" || loading}
              />
              <button type="submit" disabled={status === "checking" || loading || !code.trim()}>
                {loading ? "Validating..." : status === "checking" ? "Checking..." : "Activate planner"}
              </button>
            </form>
          )}
          {message && <p className="activation-message">{message}</p>}
          <small>Enter your code once per device. After activation, this browser opens the planner automatically.</small>
        </div>
      </section>
    </main>
  );
}
