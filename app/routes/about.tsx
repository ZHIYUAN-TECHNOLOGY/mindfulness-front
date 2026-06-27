import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { apiFetch } from "../lib/api";
import { ScrollReveal } from "../components/ScrollReveal";
import { FooterSection } from "../components/sections/FooterSection";
import { normalizeMediaUrl } from "../lib/media";

function BlurRevealImage({
  src,
  alt,
  caption,
}: {
  src: string;
  alt: string;
  caption: string;
}) {
  const [revealed, setRevealed] = useState(false);
  if (!src) return <div className="about-image-placeholder" />;
  return (
    <div className="about-image-item">
      <button
        type="button"
        className="about-image-blur-wrap"
        onClick={() => setRevealed(true)}
        aria-label={revealed ? alt : `Click to reveal ${alt}`}
      >
        <img
          src={src}
          alt={alt}
          loading="lazy"
          className={revealed ? "" : "about-image-blurred"}
        />
        {!revealed && (
          <span className="about-image-blur-hint">
            Click to view
          </span>
        )}
      </button>
      <p className="about-image-caption">{caption}</p>
    </div>
  );
}

export const Route = createFileRoute("/about")({
  component: AboutPage,
  head: () => ({
    meta: [
      { title: "About — Dr. Charles Lee" },
      {
        name: "description",
        content:
          "Plastic Surgeon Dr. Charles Lee shares his calling as the founder of two Asia Pacific Consultations.",
      },
    ],
  }),
});

function AboutPage() {
  const [settings, setSettings] = useState<Record<string, unknown>>({});

  useEffect(() => {
    apiFetch("/api/settings").then(setSettings).catch(() => {});
  }, []);

  const navLinks =
    (settings["nav.links"] as Array<{ label: string; href: string }>) || [];
  const socialLinks =
    (settings["footer.social_links"] as Array<{ platform: string; url: string }>) ||
    [];

  const eyebrow =
    (settings["about_page.eyebrow"] as string) || "ABOUT";
  const headingLine1 =
    (settings["about_page.heading_line1"] as string) || "A SURGEON";
  const headingLine2Italic =
    (settings["about_page.heading_line2_italic"] as string) || "who learned";
  const headingLine3 =
    (settings["about_page.heading_line3"] as string) || "TO TRUST GOD.";
  const body =
    (settings["about_page.body"] as string) ||
    "Plastic Surgeon Dr. Charles Lee shares his calling as the founder of two Asia Pacific Consultations, APCOMM and APCOD. Central to this calling is the understanding of the Hebraic biblical foundations of the Christian faith for transforming discipleship to Jesus of Nazareth.";

  const storyEyebrow =
    (settings["about_page.story_eyebrow"] as string) || "THE STORY";
  const storyHeadingLine1 =
    (settings["about_page.story_heading_line1"] as string) || "A MIRACLE,";
  const storyHeadingLine2 =
    (settings["about_page.story_heading_line2"] as string) || "AN EXTRAORDINARY";
  const storyHeadingLine3 =
    (settings["about_page.story_heading_line3"] as string) || "BEGINNING";

  const storyImage1Url = normalizeMediaUrl(settings["about_page.story_image1_url"] as string);
  const storyImage1Caption = (settings["about_page.story_image1_caption"] as string) || "5 APRIL 1995";
  const storyImage1Blur = (settings["about_page.story_image1_blur"] as boolean) ?? true;

  const storyImage2Url = normalizeMediaUrl(settings["about_page.story_image2_url"] as string);
  const storyImage2Caption = (settings["about_page.story_image2_caption"] as string) || "10 DAYS LATER - 15 APRIL 1995";

  const storyIntro =
    (settings["about_page.story_intro"] as string) ||
    `On a Wednesday afternoon on the 5th of April, 1995, a two-year old female child was transferred from a neighboring city for further management of a severe, third-degree scald burns injury to the buttocks region. The child was critically ill with septicemia and the prognosis was extremely poor. Surgical intervention for debridement and skin grafting was deferred with the hope that recovery was possible with intensive care management in the first instance. However her situation deteriorated rapidly and I informed the parents that the outcome for survival was minimal.`;

  const storyVisitationHeading =
    (settings["about_page.story_visitation_heading"] as string) || "A Visitation from God";
  const storyVisitationBody =
    (settings["about_page.story_visitation_body"] as string) ||
    `On the 11th of February, 1995, two months earlier, I had a visitation from God. The vision was distinct and the call was truly spiritual. I knew this was a supernatural encounter with the one, true, living God. Baptism of the Holy Spirit was immediate and my life was never the same again. I knew I had met God.\n\nFilled with the Spirit, I now knew that only the power of the Holy Spirit could heal this child. I shared this belief I had with the child's non-Christian parents and that only Jesus of Nazareth could heal their beautiful daughter and there was nothing more I could do for her, surgically and professionally but to trust God.\n\nI sought permission from the parents to allow me to pray for their child. From the day of admission on the 5th of April, I prayed with my surgical staff over the burn wounds daily and each day I would see a miracle occurring before my very eyes.\n\nNo surgery. No visits to the operation theatre for what is termed "debridement" of the burn wounds. Only prayer.`;

  const storyMiracleHeading =
    (settings["about_page.story_miracle_heading"] as string) || "A Miracle";
  const storyMiracleBody =
    (settings["about_page.story_miracle_body"] as string) ||
    `In ten days, from the 5th to the 15th of April, Jesus healed this child completely of all the burn areas and the child was discharged home with pink, newborn baby skin! The parents left the Sabah Medical Centre praising and thanking Jesus for this miraculous healing.\n\nThis miracle changed my life because I was trained in plastic and reconstructive surgery for managing burns injury but in this instance the injury was too severe, prognosis was very poor and there was nothing professionally I could do. I gave up and called upon the Lord of all life to save this child and reveal himself to these non-believers of the faith.\n\nThere was only one source of healing that I was confident would answer prayer and that was the Lord Jesus himself.\n\nI made a decision that would change the course of my life.\n\nI wanted to meet the man Jesus of Nazareth.`;

  const storyExtraordinaryHeading =
    (settings["about_page.story_extraordinary_heading"] as string) || "An Extraordinary Beginning";
  const storyExtraordinaryBody =
    (settings["about_page.story_extraordinary_body"] as string) ||
    `In May of 1996, I was led by the Spirit to attend a conference in Jerusalem titled <em>"If I forget thee, O Jerusalem"</em> from Psalm 137:5-6. One of the plenary speakers was Dwight Pryor from the Center of Judaic-Christian Studies who spoke on the topic "Our Hebrew Lord".\n\nIt was the beginning of a journey that would lead into the rediscovery of the Hebraic foundations of the Christian faith and a deeper understanding of who Jesus of Nazareth is as Lord and Savior of my life.\n\nIn July 1997 I was challenged by the founder of the Haggai Institute in Maui, Hawaii, the late Dr. John Haggai, to <em>"Attempt something so great for God that it is doomed to fail unless God be in it."</em>\n\nOn 31st July 1997, in Maui, I wrote down the vision of the Asia Pacific Consultation On Discipleship, APCOD, that there will be a gathering of Christian leaders from the Asia Pacific region and beyond, here in Kota Kinabalu, Sabah, Malaysia, to learn about the man Jesus of Nazareth and how to become transformed disciples of Jesus.\n\nOn the 25th to the 27th July, 2001, eight hundred and fifty leaders from thirty-seven nations gathered in the city of Kota Kinabalu, Malaysia, to rediscover the Hebraic understanding of the Scriptures and how to grow into Christ-likeness. How do we take the message of salvation from a predominantly Second Temple-period of biblical history and transpose it into the Greco-Roman (non-Hebrew or Jewish) context of modern-day Christianity?\n\nMore than four thousand Christians and leaders in the faith have attended these consultations — APCOD 2001 Malaysia, APCOD 2003 Sri Lanka, APCOD 2006 New Zealand, APCOD 2010 India and APCOD 2012 Malaysia when we celebrated the 10th anniversary of the faithfulness of God.`;

  const storyQuote =
    (settings["about_page.story_quote"] as string) ||
    `"What is man that you are mindful of him." Psalm 8:4`;

  const storyMindfulnessHeading =
    (settings["about_page.story_mindfulness_heading"] as string) || "Biblical Mindfulness";
  const storyMindfulnessBody =
    (settings["about_page.story_mindfulness_body"] as string) ||
    `The search for meaning of the Hebraic perspective of the abundant life in Christ led me to pursue a further understanding of Biblical covenantal consciousness and awareness of God in the present, in the here and now.\n\nHow do we inhabit time in the present, fully attentive to the deeply rich meaning of being "alive in Christ" that is rooted in the Hebrew Scriptures?\n\nHow to develop a Hebraic framework of <em>Biblical Mindfulness</em> for marketplace Christians that will empower our lives in "Being God's Image" as disciples of Christ?\n\nIn May 2022, I founded the first Asia Pacific Consultation on Marketplace Mindfulness, APCOMM 2022. The second APCOMM 2027 will be held from 15 to 16th October, 2027 during the Feast of Tabernacles.`;

  const storyCtaUrl =
    (settings["about_page.story_cta_url"] as string) || "https://www.mindfulnesstochange.com/apcomm2027";

  return (
    <main>
      {/* HERO — matches homepage editorial style */}
      <section className="section-y pt-[140px]">
        <div className="container-editorial">
          <ScrollReveal animation="scroll-reveal-up">
            <span className="eyebrow">{eyebrow}</span>
          </ScrollReveal>

          <ScrollReveal animation="scroll-reveal-up" delay="delay-1">
            <h1 className="display display-l mt-7">
              <span className="block">{headingLine1}</span>
              <span className="italic-accent block">{headingLine2Italic}</span>
              <span className="block">{headingLine3}</span>
            </h1>
          </ScrollReveal>

          <ScrollReveal animation="scroll-reveal-up" delay="delay-2">
            <p className="lead mt-10">{body}</p>
          </ScrollReveal>
        </div>
      </section>

      <div className="section-divider" />

      {/* THE STORY */}
      <section className="section-y">
        <div className="container-editorial">
          <ScrollReveal animation="scroll-reveal-up">
            <span className="eyebrow">{storyEyebrow}</span>
          </ScrollReveal>

          <ScrollReveal animation="scroll-reveal-up" delay="delay-1">
            <h2 className="display display-m mt-7">
              <span className="gold-underline">{storyHeadingLine1}</span>
              <br />
              {storyHeadingLine2}
              <br />
              {storyHeadingLine3}
            </h2>
          </ScrollReveal>

          <ScrollReveal animation="scroll-reveal-up" delay="delay-2">
            <p className="story-lead mt-10">{storyIntro}</p>
          </ScrollReveal>

          <div className="story-body mt-16">
            <ScrollReveal animation="scroll-reveal-up" delay="delay-1">
              <div className="story-section">
                <h3 className="story-section__heading">{storyVisitationHeading}</h3>
                <div className="story-section__body">
                  {storyVisitationBody.split("\n\n").map((p, i) => (
                    <p key={i} className="story-paragraph">{p}</p>
                  ))}
                </div>
              </div>
            </ScrollReveal>

            <ScrollReveal animation="scroll-reveal-up" delay="delay-1">
              <div className="story-section">
                <h3 className="story-section__heading">{storyMiracleHeading}</h3>
                <ScrollReveal animation="scroll-reveal-up" delay="delay-1">
                  <div className="about-image-row about-image-row--two mt-4 mb-4">
                    {storyImage1Blur ? (
                      <BlurRevealImage
                        src={storyImage1Url}
                        alt={storyImage1Caption}
                        caption={storyImage1Caption}
                      />
                    ) : (
                      <div className="about-image-item">
                        {storyImage1Url ? (
                          <img src={storyImage1Url} alt={storyImage1Caption} loading="lazy" />
                        ) : (
                          <div className="about-image-placeholder" />
                        )}
                        <p className="about-image-caption">{storyImage1Caption}</p>
                      </div>
                    )}
                    <div className="about-image-item">
                      {storyImage2Url ? (
                        <img src={storyImage2Url} alt={storyImage2Caption} loading="lazy" />
                      ) : (
                        <div className="about-image-placeholder" />
                      )}
                      <p className="about-image-caption">{storyImage2Caption}</p>
                    </div>
                  </div>
                </ScrollReveal>
                <div className="story-section__body">
                  {storyMiracleBody.split("\n\n").map((p, i) => (
                    <p key={i} className="story-paragraph">{p}</p>
                  ))}
                </div>
              </div>
            </ScrollReveal>

            <ScrollReveal animation="scroll-reveal-up" delay="delay-1">
              <div className="story-section">
                <h3 className="story-section__heading">{storyExtraordinaryHeading}</h3>
                <div className="story-section__body">
                  {storyExtraordinaryBody.split("\n\n").map((p, i) => (
                    <p key={i} className="story-paragraph" dangerouslySetInnerHTML={{ __html: p }} />
                  ))}
                </div>
              </div>
            </ScrollReveal>

            <ScrollReveal animation="scroll-reveal-up" delay="delay-1">
              <blockquote className="story-blockquote">
                <p>{storyQuote}</p>
              </blockquote>
            </ScrollReveal>

            <ScrollReveal animation="scroll-reveal-up" delay="delay-1">
              <div className="story-section__body">
                {storyMindfulnessBody.split("\n\n").map((p, i) => (
                  <p key={i} className="story-paragraph" dangerouslySetInnerHTML={{ __html: p }} />
                ))}
              </div>
            </ScrollReveal>

            <ScrollReveal animation="scroll-reveal-up" delay="delay-1">
              <p className="story-cta">
                For more information, please visit:{" "}
                <a
                  href={storyCtaUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gold-primary underline underline-offset-4 hover:text-gold-light transition"
                >
                  {storyCtaUrl}
                </a>
              </p>
            </ScrollReveal>
          </div>
        </div>
      </section>

      <div className="section-divider" />

      {/* TIMELINE — A CALLING IN YEARS */}
      <section className="section-y">
        <div className="container-editorial">
          <ScrollReveal animation="scroll-reveal-up">
            <div className="section-header">
              <div className="left">
                <span className="eyebrow mb-5 inline-flex">
                  {(settings["about_page.timeline_eyebrow"] as string) || "A CALLING IN YEARS"}
                </span>
                <h2 className="display mt-2" style={{ fontSize: "clamp(32px, 4.5vw, 56px)" }}>
                  {(settings["about_page.timeline_heading_line1"] as string) || "FORTY-"}
                  {(settings["about_page.timeline_heading_line2"] as string) || "ONE"}
                  <br />
                  {(settings["about_page.timeline_heading_line3"] as string) || "YEARS,"}
                  <span className="italic-accent">
                    {" "}
                    {(settings["about_page.timeline_heading_accent"] as string) || "prayerfully."}
                  </span>
                </h2>
              </div>
              <div className="right">
                <div className="timeline-quote">
                  <p className="body-prose">
                    {(settings["about_page.timeline_quote"] as string) ||
                      'A journey “with foundations, whose architect and builder is God.” Hebrews 11:10'}
                  </p>
                </div>
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal animation="scroll-reveal-up" delay="delay-1">
            <div className="timeline-table">
              {getTimelineItems(settings).map((item) => (
                <div key={item.year + item.label} className="timeline-row">
                  <span className="timeline-year numeric">{item.year}</span>
                  <span className="timeline-body" dangerouslySetInnerHTML={{ __html: item.description }} />
                  <span className="timeline-label">{item.label}</span>
                </div>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </section>

      <div className="section-divider" />

      {/* SPEAKING INQUIRIES */}
      <section className="section-y bg-ink text-paper">
        <div className="container-editorial">
          <div className="grid md:grid-cols-2 gap-[60px] items-center">
            <div>
              <span className="eyebrow-bare" style={{ color: "var(--honey-light)" }}>
                Speaking inquiries
              </span>
              <h2
                className="display display-l mt-4"
                style={{ color: "var(--paper)" }}
              >
                Have{" "}
                <span className="italic-accent" style={{ color: "var(--honey-light)" }}>
                  Charles speak.
                </span>
              </h2>
              <p className="lead mt-6" style={{ color: "rgba(244,239,228,0.78)" }}>
                Charles is pleased to share his testimony or information regarding APCOMM 2027 to any
                Christian communities in Malaysia either in person or through Zoom.
              </p>
            </div>
            <div
              style={{
                background: "rgba(244,239,228,0.06)",
                padding: 36,
                borderRadius: 4,
                border: "1px solid rgba(244,239,228,0.15)",
              }}
            >
              <span className="label-meta" style={{ color: "var(--honey-light)" }}>
                Send an invitation
              </span>
              <a
                href="mailto:charles@mindfulnesstochange.com"
                className="block font-serif text-[28px] mt-3.5"
                style={{ color: "var(--paper)" }}
              >
                charles@mindfulnesstochange.com
              </a>
              <p
                className="mt-3"
                style={{
                  fontFamily: "var(--sans)",
                  fontSize: 15,
                  color: "rgba(244,239,228,0.7)",
                }}
              >
                Replies in approximately 14 days. Please include nature of request or any question
                you would most like Charles to address.
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="section-divider" />

      {/* NEWSLETTER */}
      <section className="section-y grid-pattern" style={{ background: "var(--paper-soft)" }}>
        <div className="container-editorial text-center">
          <ScrollReveal animation="scroll-reveal-up">
            <span className="eyebrow mb-5 inline-flex">
              {(settings["about_page.newsletter_eyebrow"] as string) || "Subscribe"}
            </span>
          </ScrollReveal>
          <ScrollReveal animation="scroll-reveal-up" delay="delay-1">
            <h2 className="display mt-2" style={{ fontSize: "clamp(32px, 4.5vw, 56px)" }}>
              {(settings["about_page.newsletter_heading"] as string) || "The Mindful Christian Newsletter"}
            </h2>
          </ScrollReveal>
          <ScrollReveal animation="scroll-reveal-up" delay="delay-2">
            <p className="body-prose mt-6 max-w-[52ch] mx-auto">
              <span dangerouslySetInnerHTML={{
                __html: (settings["about_page.newsletter_body"] as string) ||
                  "Join our APCOMM community for monthly reflections, event updates and media resources on <em>‘Biblical Mindfulness’</em>."
              }} />
            </p>
          </ScrollReveal>
          <ScrollReveal animation="scroll-reveal-up" delay="delay-2">
            <form
              className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3 max-w-xl mx-auto"
              onSubmit={(e) => {
                e.preventDefault();
                const email = (e.currentTarget.elements.namedItem("email") as HTMLInputElement)?.value;
                if (!email?.trim()) return;
                apiFetch("/api/newsletter/subscribe", {
                  method: "POST",
                  body: JSON.stringify({ email: email.trim() }),
                }).then(() => {
                  alert("Thank you for subscribing!");
                  (e.currentTarget as HTMLFormElement).reset();
                }).catch(() => {
                  alert("Something went wrong. Please try again.");
                });
              }}
            >
              <input
                type="email"
                name="email"
                placeholder="Your email address"
                required
                className="w-full sm:flex-1 px-4 py-3 rounded border border-line bg-paper text-ink placeholder:text-ink-quiet focus:outline-none focus:border-gold-primary"
              />
              <button
                type="submit"
                className="btn-ed btn-accent px-8 py-3 w-full sm:w-auto"
              >
                {(settings["about_page.newsletter_button"] as string) || "Subscribe"}
              </button>
            </form>
          </ScrollReveal>
        </div>
      </section>

      <div className="section-divider" />

      {/* CTA */}
      <section className="section-y" style={{ background: "var(--paper-soft)" }}>
        <div className="container-editorial text-center">
          <ScrollReveal animation="scroll-reveal-up">
            <h2
              className="display"
              style={{ fontSize: "clamp(36px, 5vw, 64px)", lineHeight: 1.05 }}
            >
              {(settings["about_page.cta_heading_line1"] as string) || "BEGIN WHERE"}
              <span className="italic-accent">
                {" "}
                {(settings["about_page.cta_heading_accent"] as string) || "you are."}
              </span>
            </h2>
          </ScrollReveal>
          <ScrollReveal animation="scroll-reveal-up" delay="delay-1">
            <div className="mt-10 flex flex-wrap justify-center gap-3.5">
              <Link
                to={(settings["about_page.cta_button1_url"] as string) || "/events/e6941a1e-3cb2-4846-be15-78e763fb923e"}
                className="btn-ed btn-accent px-8 py-3.5"
              >
                {(settings["about_page.cta_button1_label"] as string) || "VISIT APCOMM 2027"}
              </Link>
              <Link
                to={(settings["about_page.cta_button2_url"] as string) || "/memoir"}
                className="btn-ed btn-ghost px-8 py-3.5"
              >
                {(settings["about_page.cta_button2_label"] as string) || "READ THE MEMOIR"}
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>

      <div className="section-divider" />

      {/* Footer */}
      <FooterSection
        copyright={
          (settings["footer.copyright"] as string) || "Copyright © 2026"
        }
        poweredBy={
          (settings["footer.powered_by"] as string) || "Powered by ZYT"
        }
        contactUrl={(settings["footer.contact_url"] as string) || "/contact"}
        socialLinks={socialLinks}
        navLinks={navLinks}
        brandName={(settings["footer.brand"] as string) || "Charles Lee"}
        tagline={
          (settings["footer.tagline"] as string) ||
          "Founder of the Asia Pacific Consultation On Marketplace Mindfulness, APCOMM."
        }
      />
    </main>
  );
}

interface Zone {
  code: string;
  title: string;
  body: string;
}

interface TimelineItem {
  year: string;
  description: string;
  label: string;
}

const DEFAULT_ZONES: Zone[] = [
  { code: "01 · H", title: "HINENI", body: "\"Here I am\". A response to a divine call that is hardest of the seven. An expression of absolute surrender, deep humility and trust to listen and readiness to serve." },
  { code: "02 · E", title: "ETHICAL", body: "A consciousness in Hebrew thought that refers to discipline and active shaping of one's inner character and response to a higher moral authority." },
  { code: "03 · B", title: "BIBLICAL", body: "A reverent attentiveness to all scripture which is God-breathed and rooted in the Hebrew bible for learning, teaching in righteousness for every good work." },
  { code: "04 · R", title: "RELATIONAL", body: "In Hebrew thought relates to being \"set apart\" in relationship to God as Lord of all life." },
  { code: "05 · A", title: "AWARENESS", body: "In the present moment. In the 'Here & Now' that God is eternally present in time." },
  { code: "06 · I", title: "INHABIT", body: "How to inhabit time? Finding hope in the future by reconciling with the past and trusting God's redemptive presence in the here and now." },
  { code: "07 · C", title: "COVENANT", body: "The foundation of the Hebrew scriptures is the covenantal relationship and bond between God and humanity. The core essence of covenant is expressed in the phrase: \"I will be your God, and you will be My people.\"" },
];

function getZones(src: Record<string, unknown>): Zone[] {
  const val = src["about_page.zones"];
  if (Array.isArray(val) && val.length > 0) return val as Zone[];
  return DEFAULT_ZONES;
}

const DEFAULT_TIMELINE: TimelineItem[] = [
  { year: "1985", description: "Trained as a plastic surgeon in the United Kingdom.", label: "BEGINNING" },
  { year: "1989", description: "SABAH. Established the first Department of Plastic and Reconstructive Surgery.", label: "CONSULTANT" },
  { year: "1995", description: "A Visitation from God. Baptism of the Holy Spirit.", label: "VOICE" },
  { year: "1995", description: "A Miracle from God. The heart's desire to meet the man Jesus.", label: "CALLING" },
  { year: "1996", description: '<em>"If I forget thee, O Jerusalem,..."</em> The journey to rediscover our Hebrew roots begins.', label: "ROOTS" },
  { year: "2001", description: "APCOD. Launching the Asia Pacific Consultations on Discipleship.", label: "VISION" },
  { year: "2011", description: "Meeting with death becomes a reality. Open heart bypass surgery.", label: "SURGERY" },
  { year: "2021", description: "From Death into Life. The writing begins.", label: "MEMOIR" },
  { year: "2022", description: "APCOMM. Launching the Asia Pacific Consultation On Marketplace Mindfulness, APCOMM", label: "MIND" },
];

function getTimelineItems(src: Record<string, unknown>): TimelineItem[] {
  const val = src["about_page.timeline_items"];
  if (Array.isArray(val) && val.length > 0) return val as TimelineItem[];
  return DEFAULT_TIMELINE;
}
