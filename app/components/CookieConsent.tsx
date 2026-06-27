import { useState, useEffect } from "react";

const CONSENT_KEY = "mindfulness_terms_accepted";

export function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      const accepted = localStorage.getItem(CONSENT_KEY);
      if (!accepted) {
        setVisible(true);
      }
    } catch {
      setVisible(true);
    }
  }, []);

  const accept = () => {
    try {
      localStorage.setItem(CONSENT_KEY, "true");
    } catch {
      // ignore
    }
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-brown-dark/95 border-t border-gold-light/20 px-4 py-3">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
        <p className="text-sm text-gold-pale text-center sm:text-left">
          By using this site, you agree to our{" "}
          <a href="/terms" className="underline hover:text-white transition">Terms of Service</a>
          {" "}and{" "}
          <a href="/privacy" className="underline hover:text-white transition">Privacy Policy</a>.
        </p>
        <button
          onClick={accept}
          className="shrink-0 bg-gold-primary text-brown-dark text-sm font-semibold px-5 py-2 rounded hover:bg-gold-medium transition"
        >
          Accept
        </button>
      </div>
    </div>
  );
}
