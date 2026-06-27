import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/terms")({
  component: TermsComponent,
  head: () => ({
    meta: [{ title: "Terms · Dr. Charles Lee" }],
  }),
});

const SECTIONS: { title: string; body: string }[] = [
  {
    title: "1. Acceptance",
    body: "By using charleslee.co you accept these terms. If you do not, please leave the site — and write, if anything here can be made clearer.",
  },
  {
    title: "2. Use of the site",
    body: "Use the site for lawful purposes. Do not abuse other readers, scrape content at volume, or attempt to access members' chapters without a membership.",
  },
  {
    title: "3. Intellectual property",
    body: "The text, images, podcasts, audio, and design on this site are the work of Dr. Charles Lee and his collaborators. You may quote brief passages with attribution. Reproduction of whole chapters or episodes requires written permission.",
  },
  {
    title: "4. Memberships",
    body: "Membership is a one-time 30-day pass. It does not renew automatically. You can buy another pass at any time to extend your access. Refunds are issued at our discretion, gladly.",
  },
  {
    title: "5. Disclaimer",
    body: "The writing on this site is offered as one practitioner's account, not as medical or clinical advice. If you are in crisis, please consult a qualified professional — findahelpline.com is a good place to start.",
  },
  {
    title: "6. Limitation of liability",
    body: "To the extent permitted by law, we are not liable for indirect, incidental, or consequential damages arising from your use of the site.",
  },
  {
    title: "7. Governing law",
    body: "These terms are governed by the laws of Malaysia, where Charles Lee's studio is registered.",
  },
  {
    title: "8. Changes",
    body: "If these terms change in any meaningful way, we will note the change in the Sunday letter and update the date below.",
  },
];

function TermsComponent() {
  return (
    <main className="pt-[160px] pb-[120px] min-h-[100dvh]">
      <div className="container-prose">
        <span className="eyebrow">Terms · Updated May 2026</span>
        <h1 className="display display-l mt-7">
          A small <span className="italic-accent">agreement.</span>
        </h1>
        <p className="lead mt-7">
          Plain terms, in plain words. Nothing surprising, written for readers rather than
          lawyers.
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
