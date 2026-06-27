import {
  Outlet,
  createRootRoute,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { createContext, useState, useContext } from "react";
import { getMeServer, getSettingsServer } from "../lib/auth-server";
import type { User } from "../shared";
import { Navbar } from "../components/Navbar";
import { CookieConsent } from "../components/CookieConsent";
import "../styles/tailwind.css";

export const AuthContext = createContext<{ user: User | null; setUser: (u: User | null) => void }>({
  user: null,
  setUser: () => {},
});

export const Route = createRootRoute({
  // Fetched server-side during SSR with the user's cookie forwarded, so the
  // initial HTML already knows who the user is and the navbar renders the
  // correct (logged-in vs logged-out) branch on first paint — no flicker.
  loader: async () => {
    const [user, settings] = await Promise.all([
      getMeServer(),
      getSettingsServer(),
    ]);
    return { user, settings };
  },
  component: RootComponent,
  notFoundComponent: () => (
    <div className="min-h-[calc(100dvh_-_64px)] flex items-center justify-center px-6 text-center">
      <div className="container-prose">
        <span className="eyebrow-bare">Error 404</span>
        <h1 className="display display-l mt-6">Lost the <span className="italic-accent">path.</span></h1>
        <p className="lead mt-6 mx-auto">The page you requested does not exist. Wander back to the homepage and start again.</p>
        <a href="/" className="btn-link mt-8 inline-flex">Return home <span className="btn-arrow">→</span></a>
      </div>
    </div>
  ),
});

function RootComponent() {
  const { user: initialUser, settings } = Route.useLoaderData();
  const [user, setUser] = useState<User | null>(initialUser);

  return (
    <html className="overflow-x-hidden">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" type="image/x-icon" href="/favicon.ico?v=2" />
        <link rel="shortcut icon" type="image/x-icon" href="/favicon.ico?v=2" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Archivo:wght@400;500;600;700;800;900&family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Inter:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
        <HeadContent />
      </head>
      <body className="relative overflow-x-hidden font-sans antialiased bg-paper text-ink">
        <AuthContext.Provider value={{ user, setUser }}>
          <div className="relative z-10">
            <Navbar initialSettings={settings} />
            <Outlet />
          </div>
        </AuthContext.Provider>
        <CookieConsent />
        <Scripts />
      </body>
    </html>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
