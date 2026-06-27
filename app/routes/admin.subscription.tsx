import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { apiFetch } from "../lib/api";

export const Route = createFileRoute("/admin/subscription")({
  component: AdminSubscriptionPage,
});

function AdminSubscriptionPage() {
  const [productName, setProductName] = useState("30-Day Membership Pass");
  const [productDescription, setProductDescription] = useState(
    "Thirty days of members-only access to book chapters and event recordings."
  );
  const [regularPrice, setRegularPrice] = useState("49");
  const [earlyBirdPrice, setEarlyBirdPrice] = useState("29");
  const [earlyBirdUntil, setEarlyBirdUntil] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [stripeProductId, setStripeProductId] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    apiFetch("/api/stripe/config")
      .then((cfg) => {
        setProductName(cfg.productName || "30-Day Membership Pass");
        setProductDescription(
          cfg.productDescription ||
            "Thirty days of members-only access to book chapters and event recordings."
        );
        setRegularPrice(cfg.regularPriceDisplay || "49");
        setEarlyBirdPrice(cfg.earlyBirdPriceDisplay || "29");
        setEarlyBirdUntil(cfg.earlyBirdUntilRaw || "");
        setCurrency(cfg.currency || "USD");
        setStripeProductId(cfg.stripeProductId || "");
      })
      .catch(() => {
        // Fallback: load raw settings if config endpoint fails.
        apiFetch("/api/settings")
          .then((data) => {
            setProductName(data["membership.product_name"] || "30-Day Membership Pass");
            setProductDescription(
              data["membership.product_description"] ||
                "Thirty days of members-only access to book chapters and event recordings."
            );
            setRegularPrice(String(data["membership.regular_price"] ?? "49"));
            setEarlyBirdPrice(String(data["membership.early_bird_price"] ?? "29"));
            setEarlyBirdUntil(String(data["membership.early_bird_until"] ?? ""));
            setCurrency(data["membership.currency"] || "USD");
            setStripeProductId(data["membership.stripe_product_id"] || "");
          })
          .catch(() => setError("Failed to load membership pass config"))
          .finally(() => setLoading(false));
      })
      .finally(() => {
        if (loading) setLoading(false);
      });
  }, []);

  const save = async () => {
    setSaving(true);
    setError("");
    setMessage("");
    try {
      await Promise.all([
        apiFetch("/api/settings/membership.product_name", {
          method: "PUT",
          body: JSON.stringify({ value: productName || "30-Day Membership Pass" }),
        }),
        apiFetch("/api/settings/membership.product_description", {
          method: "PUT",
          body: JSON.stringify({ value: productDescription }),
        }),
        apiFetch("/api/settings/membership.regular_price", {
          method: "PUT",
          body: JSON.stringify({ value: regularPrice || "49" }),
        }),
        apiFetch("/api/settings/membership.early_bird_price", {
          method: "PUT",
          body: JSON.stringify({ value: earlyBirdPrice || "" }),
        }),
        apiFetch("/api/settings/membership.early_bird_until", {
          method: "PUT",
          body: JSON.stringify({ value: earlyBirdUntil || "" }),
        }),
        apiFetch("/api/settings/membership.currency", {
          method: "PUT",
          body: JSON.stringify({ value: currency || "USD" }),
        }),
      ]);
      setMessage("Membership pass pricing saved.");
    } catch (e: any) {
      setError(e.message || "Failed to save membership pass pricing");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="text-sm opacity-70">Loading...</p>;

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Membership Pass Pricing</h1>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Product Name</label>
          <input
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            className="w-full px-3 py-2 rounded bg-brown-dark border border-gold-light/20 text-gold-pale"
            placeholder="30-Day Membership Pass"
          />
          <p className="text-xs text-gold-light/70 mt-1">Shown on Stripe checkout.</p>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Product Description</label>
          <textarea
            value={productDescription}
            onChange={(e) => setProductDescription(e.target.value)}
            rows={2}
            className="w-full px-3 py-2 rounded bg-brown-dark border border-gold-light/20 text-gold-pale"
            placeholder="Thirty days of members-only access..."
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Regular Price</label>
            <input
              type="number"
              min={0}
              step="0.01"
              value={regularPrice}
              onChange={(e) => setRegularPrice(e.target.value)}
              className="w-full px-3 py-2 rounded bg-brown-dark border border-gold-light/20 text-gold-pale"
              placeholder="49"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Early-bird Price</label>
            <input
              type="number"
              min={0}
              step="0.01"
              value={earlyBirdPrice}
              onChange={(e) => setEarlyBirdPrice(e.target.value)}
              className="w-full px-3 py-2 rounded bg-brown-dark border border-gold-light/20 text-gold-pale"
              placeholder="29"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Early-bird Until</label>
            <input
              type="datetime-local"
              value={earlyBirdUntil}
              onChange={(e) => setEarlyBirdUntil(e.target.value)}
              className="w-full px-3 py-2 rounded bg-brown-dark border border-gold-light/20 text-gold-pale"
            />
            <p className="text-xs text-gold-light/70 mt-1">Leave blank to disable early-bird pricing.</p>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Currency</label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full px-3 py-2 rounded bg-brown-dark border border-gold-light/20 text-gold-pale"
            >
              <option value="USD">USD</option>
              <option value="MYR">MYR</option>
              <option value="EUR">EUR</option>
              <option value="GBP">GBP</option>
              <option value="SGD">SGD</option>
              <option value="AUD">AUD</option>
              <option value="CAD">CAD</option>
            </select>
          </div>
        </div>
        {stripeProductId && (
          <div>
            <label className="block text-sm font-medium mb-1">Stripe Product ID</label>
            <input
              value={stripeProductId}
              disabled
              className="w-full px-3 py-2 rounded bg-brown-dark/50 border border-gold-light/20 text-gold-light/70 cursor-not-allowed"
            />
            <p className="text-xs text-gold-light/70 mt-1">Auto-generated. Read-only.</p>
          </div>
        )}
        {error && <p className="text-sm text-red-300">{error}</p>}
        {message && <p className="text-sm text-green-300 font-medium">{message}</p>}
        <button
          onClick={save}
          disabled={saving}
          className="px-5 py-2 rounded bg-gold-primary text-brown-dark font-semibold disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save Pass Pricing"}
        </button>
      </div>
    </div>
  );
}
