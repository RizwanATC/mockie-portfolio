import Image from "next/image";
import { FileText, Mail, MapPin } from "lucide-react";
import { GitHubLogoIcon, LinkedInLogoIcon, TwitterLogoIcon } from "@radix-ui/react-icons";
import { apps, levels, profile } from "@/data/resume";
import { appNotes, education, intro, jobs, sideProjects, skillGroups } from "@/data/ledger";
import ContactForm from "./ContactForm";

// The plain view: the whole portfolio as one readable page, for recruiters, reduced motion and devices without WebGL.
// Same materials as the 3D kingdom (parchment, oak, ink, heraldic blue), set for reading rather than play.

const NAV = [
  { href: "#work", label: "Work" },
  { href: "#apps", label: "Apps" },
  { href: "#projects", label: "Projects" },
  { href: "#skills", label: "Skills" },
  { href: "#contact", label: "Contact" },
];

const WRAP = "mx-auto w-full max-w-6xl px-5 sm:px-8";
const H2 = "font-display text-4xl font-extrabold leading-none text-oak-deep sm:text-5xl";

function Tags({ items }: { items: string[] }) {
  return (
    <ul className="flex flex-wrap gap-1.5">
      {items.map((t) => (
        <li key={t} className="rounded-md border border-oak/35 bg-vellum/70 px-2 py-0.5 text-sm text-ink">
          {t}
        </li>
      ))}
    </ul>
  );
}

function Bullet() {
  return (
    <svg viewBox="0 0 10 10" aria-hidden className="mt-[0.55em] h-2 w-2 shrink-0">
      <path d="M5 0.8 9.2 5 5 9.2 0.8 5Z" fill="#6a4327" />
    </svg>
  );
}

const ICON = "h-[18px] w-[18px]";

export default function PlainSite() {
  return (
    <div className="min-h-[100dvh] bg-[#f6ecd4] text-ink">
      <header className="sticky top-0 z-40 border-b-2 border-oak-deep/80 bg-[#f6ecd4]/95 backdrop-blur-sm">
        <div className={`${WRAP} flex h-16 items-center gap-6`}>
          <a href="#top" className="font-display text-2xl font-extrabold text-oak-deep">
            {profile.alias}
          </a>
          <nav aria-label="Sections" className="-mr-5 ml-auto overflow-x-auto pr-5 sm:mr-0 sm:pr-0">
            <ul className="flex gap-1 text-lg font-medium">
              {NAV.map((n) => (
                <li key={n.href}>
                  <a href={n.href} className="block whitespace-nowrap rounded-md px-2.5 py-1 text-ink-soft transition-colors hover:bg-vellum hover:text-ink">
                    {n.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </header>

      <main id="top">
        {/* who */}
        <section className={`${WRAP} grid items-center gap-10 py-16 sm:py-24 md:grid-cols-[1fr_auto]`}>
          <div>
            <h1 className="font-display text-5xl font-extrabold leading-[0.95] text-oak-deep sm:text-7xl">{profile.name}</h1>
            <p className="mt-4 text-2xl leading-snug text-ink">
              {profile.title}, known as {profile.alias}
            </p>
            <p className="mt-2 flex items-center gap-1.5 text-lg text-ink-soft">
              <MapPin size={18} strokeWidth={2} aria-hidden />
              {profile.location.replace(", MY", ", Malaysia")}
            </p>
            <p className="mt-6 max-w-[62ch] text-xl leading-relaxed text-ink">{intro}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href={`mailto:${profile.email}`} className="btn-heraldic inline-flex items-center gap-2 px-5 py-2.5 font-display text-lg font-bold">
                <Mail size={20} strokeWidth={2} aria-hidden />
                Email Mockie
              </a>
              <a href="/resume/resume.pdf" className="plank inline-flex items-center gap-2 px-4 py-2.5 text-lg font-medium">
                <FileText size={18} strokeWidth={2} aria-hidden />
                Résumé (PDF)
              </a>
              <a href={profile.github} target="_blank" rel="noreferrer" className="plank inline-flex items-center gap-2 px-4 py-2.5 text-lg font-medium">
                <GitHubLogoIcon className={ICON} aria-hidden />
                GitHub
              </a>
              <a href={profile.linkedin} target="_blank" rel="noreferrer" className="plank inline-flex items-center gap-2 px-4 py-2.5 text-lg font-medium">
                <LinkedInLogoIcon className={ICON} aria-hidden />
                LinkedIn
              </a>
            </div>
          </div>
          <div className="relative mx-auto h-56 w-56 overflow-hidden rounded-full border-4 border-oak-deep shadow-[0_0_0_6px_#d9a531,0_0_0_9px_#3d2616,0_24px_40px_-16px_rgb(43_28_18/0.6)] sm:h-72 sm:w-72 md:order-none">
            <Image src="/profile/avatar.jpg" alt={`Portrait of ${profile.name}`} fill sizes="288px" className="object-cover" priority />
          </div>
        </section>

        {/* work */}
        <section id="work" className="scroll-mt-20 border-t-2 border-oak-deep/80 py-16 sm:py-20">
          <div className={WRAP}>
            <h2 className={H2}>Work</h2>
            <ol className="mt-10">
              {jobs.map((j) => (
                <li key={j.company} className="grid gap-x-10 gap-y-3 border-t border-oak/25 py-8 first:border-t-0 first:pt-0 md:grid-cols-[11rem_1fr]">
                  <div className="text-lg tabular-nums text-ink-soft">
                    {j.period}
                    {j.current && <span className="ml-2 rounded-md bg-heraldic px-2 py-0.5 text-sm font-medium text-vellum md:ml-0 md:mt-2 md:block md:w-fit">Current</span>}
                  </div>
                  <div className="max-w-[70ch]">
                    <h3 className="font-display text-3xl font-bold leading-tight text-ink">{j.company}</h3>
                    <p className="text-lg text-ink-soft">{j.role}</p>
                    {j.projects.map((p) => (
                      <div key={p.name} className="mt-5">
                        <h4 className="text-lg font-bold">{p.name}</h4>
                        <ul className="mt-2 space-y-1.5 text-lg leading-relaxed">
                          {p.points.map((pt) => (
                            <li key={pt} className="flex gap-3">
                              <Bullet />
                              {pt}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                    <div className="mt-5">
                      <Tags items={j.tags} />
                    </div>
                  </div>
                </li>
              ))}
              <li className="grid gap-x-10 gap-y-3 border-t border-oak/25 py-8 md:grid-cols-[11rem_1fr]">
                <div className="text-lg text-ink-soft">Education</div>
                <div>
                  <h3 className="font-display text-3xl font-bold leading-tight">{education.degree}</h3>
                  <p className="text-lg text-ink-soft">
                    {education.school}, {education.grade}
                  </p>
                </div>
              </li>
            </ol>
          </div>
        </section>

        {/* apps */}
        <section id="apps" className="scroll-mt-20 border-t-2 border-oak-deep/80 bg-vellum py-16 sm:py-20">
          <div className={WRAP}>
            <h2 className={H2}>Apps on Google Play and beyond</h2>
            <div className="mt-12 space-y-16">
              {apps.map((a, i) => {
                const where = levels.find((l) => l.id === a.level);
                const note = appNotes[a.id];
                return (
                  <article key={a.id} className="grid items-center gap-8 md:grid-cols-[minmax(0,1fr)_minmax(0,1.35fr)] md:gap-12">
                    <div className={i % 2 ? "md:order-2" : ""}>
                      <h3 className="font-display text-4xl font-extrabold leading-none text-oak-deep">{a.name}</h3>
                      <p className="mt-3 text-xl text-ink">{note?.blurb ?? a.tagline}</p>
                      {where?.company && <p className="mt-1 text-lg text-ink-soft">Built at {where.company}</p>}
                      {note && (
                        <div className="mt-4">
                          <Tags items={note.facts} />
                        </div>
                      )}
                      {a.href && (
                        <a href={a.href} target="_blank" rel="noreferrer" className="btn-heraldic mt-6 inline-flex px-4 py-2 text-lg font-medium">
                          Get it on Google Play
                        </a>
                      )}
                    </div>
                    <ul data-lenis-prevent className="-mx-5 flex snap-x gap-3 overflow-x-auto px-5 pb-3 sm:mx-0 sm:px-0" aria-label={`${a.name} screenshots`}>
                      {a.screens.map((src, k) => {
                        const wide = a.landscape?.includes(k);
                        return (
                          <li
                            key={src}
                            className={`relative shrink-0 snap-start overflow-hidden rounded-[18px] border-[5px] border-ink bg-ink shadow-[0_14px_24px_-12px_rgb(43_28_18/0.6)] ${
                              wide ? "aspect-[19.5/9] h-[150px] self-center" : "aspect-[9/19.5] w-[132px]"
                            }`}
                          >
                            <Image src={src} alt={`${a.name} screen ${k + 1}`} fill sizes="140px" className="object-cover" />
                          </li>
                        );
                      })}
                    </ul>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        {/* side projects */}
        <section id="projects" className="scroll-mt-20 border-t-2 border-oak-deep/80 py-16 sm:py-20">
          <div className={WRAP}>
            <h2 className={H2}>Side projects</h2>
            <ul className="mt-10 grid gap-x-12 md:grid-cols-2">
              {sideProjects.map((p) => (
                <li key={p.title} className="border-t border-oak/25 py-6">
                  <div className="flex items-baseline justify-between gap-4">
                    <h3 className="font-display text-2xl font-bold leading-tight">{p.title}</h3>
                    <a
                      href={p.github}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex shrink-0 items-center gap-1.5 text-base font-medium text-heraldic underline-offset-4 hover:underline"
                    >
                      <GitHubLogoIcon className="h-4 w-4" aria-hidden />
                      Code<span className="sr-only"> for {p.title}</span>
                    </a>
                  </div>
                  <p className="mt-2 max-w-[60ch] text-lg leading-relaxed text-ink">{p.description}</p>
                  <div className="mt-3">
                    <Tags items={p.tags} />
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* skills */}
        <section id="skills" className="scroll-mt-20 border-t-2 border-oak-deep/80 py-16 sm:py-20">
          <div className={WRAP}>
            <h2 className={H2}>Skills</h2>
            <dl className="mt-10">
              {skillGroups.map((g) => (
                <div key={g.title} className="grid gap-x-10 gap-y-2 border-t border-oak/25 py-5 md:grid-cols-[11rem_1fr]">
                  <dt className="font-display text-2xl font-bold">{g.title}</dt>
                  <dd className="text-lg leading-relaxed text-ink">{g.skills.join(", ")}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        {/* contact */}
        <section id="contact" className="scroll-mt-20 border-t-2 border-oak-deep/80 bg-vellum py-16 sm:py-20">
          <div className={`${WRAP} grid gap-10 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]`}>
            <div>
              <h2 className={H2}>Let&apos;s work together</h2>
              <p className="mt-5 max-w-[46ch] text-xl leading-relaxed">
                Looking for a mobile developer or UI/UX designer for your team? Send a message and Mockie will get back to you.
              </p>
              <ul className="mt-8 space-y-3 text-lg">
                <li>
                  <a href={`mailto:${profile.email}`} className="inline-flex items-center gap-2.5 text-heraldic underline-offset-4 hover:underline">
                    <Mail size={18} strokeWidth={2} aria-hidden />
                    {profile.email}
                  </a>
                </li>
                <li>
                  <a href={profile.linkedin} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2.5 text-heraldic underline-offset-4 hover:underline">
                    <LinkedInLogoIcon className={ICON} aria-hidden />
                    LinkedIn
                  </a>
                </li>
                <li>
                  <a href={profile.github} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2.5 text-heraldic underline-offset-4 hover:underline">
                    <GitHubLogoIcon className={ICON} aria-hidden />
                    GitHub
                  </a>
                </li>
                <li>
                  <a href={profile.x} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2.5 text-heraldic underline-offset-4 hover:underline">
                    <TwitterLogoIcon className={ICON} aria-hidden />
                    X (Twitter)
                  </a>
                </li>
              </ul>
            </div>
            <ContactForm />
          </div>
        </section>
      </main>

      <footer className="border-t-2 border-oak-deep/80">
        <div className={`${WRAP} flex flex-col gap-1 py-8 pb-24 text-base text-ink-soft sm:flex-row sm:justify-between`}>
          <p>
            © {new Date().getFullYear()} {profile.name}
          </p>
          <p>The 3D kingdom is built from KayKit packs by Kay Lousberg.</p>
        </div>
      </footer>
    </div>
  );
}
