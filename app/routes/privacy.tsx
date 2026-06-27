import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/privacy")({
  component: PrivacyComponent,
  head: () => ({
    meta: [{ title: "Privacy · Dr. Charles Lee" }],
  }),
});

const SECTIONS: { title: string; body: string }[] = [
  {
    title: "1. Information we collect",
    body: "We collect what you give us — your name, email address, and any details you choose to share when you register, write a letter, or take part in the newsletter or membership. We collect very little, on purpose.",
  },
  {
    title: "2. How we use it",
    body: "To send the Sunday letter, to keep your membership account, to reply when you write, and to understand — in aggregate — what readers find useful. We do not sell, rent, or trade your personal information.",
  },
  {
    title: "3. Cookies",
    body: "A small number of cookies remember whether you are signed in and whether you have already seen the cookie banner. We do not use third-party advertising cookies.",
  },
  {
    title: "4. Third parties",
    body: "Stripe handles membership billing. A transactional email provider sends the Sunday letter and the reset links. Each of them is bound by their own privacy policy and processes only what is needed to perform that service.",
  },
  {
    title: "5. Data security",
    body: "We protect your information with reasonable technical and organisational measures. No method of transmission is perfectly secure, but we take it seriously.",
  },
  {
    title: "6. Your rights",
    body: "You can request access to, correction of, or deletion of the personal information we hold about you at any time. Write to charles@mindfulnesstochange.com and we will respond within fourteen days.",
  },
  {
    title: "7. Changes to this policy",
    body: "If this policy changes in any meaningful way, we will say so in the Sunday letter and update the date below.",
  },
  {
    title: "8. Contact",
    body: "Questions about privacy go to charles@mindfulnesstochange.com.",
  },
];

function PrivacyComponent() {
  return (
    <main className="pt-[160px] pb-[120px] min-h-[100dvh]">
      <div className="container-prose">
        <span className="eyebrow">Privacy policy · Updated May 2026</span>
        <h1 className="display display-l mt-7">
          A quiet <span className="italic-accent">privacy.</span>
        </h1>
        <p className="lead mt-7">
          We collect very little, and only what helps us serve you. This page explains what,
          why, and how — in plain words.
        </p>

        <div className="mt-16 body-prose">
          {SECTIONS.map((s) => (
            <div key={s.title} className="pt-9 mt-9" style={{ borderTop: "1px solid var(--line)" }}>
              <h2 className="display display-s mb-4">{s.title}</h2>
              <p>{s.body}</p>
            </div>
          ))}
        </div>

        <p className="mt-16 label-meta">Last updated: May 2026</p>
      </div>
    </main>
  );
}
