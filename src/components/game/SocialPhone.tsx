"use client";

import { Html } from "@react-three/drei";
import { InstagramLogoIcon } from "@radix-ui/react-icons";
import { profile } from "@/data/resume";
import { PhoneShell, SCREEN_SIZE } from "./Phone";

// Title-screen phones: one live, clickable profile card per social network, rendered on an iPhone screen.

// Page is laid out at this CSS width; drei's transform mode renders 40px per world unit, so scale to the hole.
const PAGE_W = 300;
const PAGE_H = Math.round((PAGE_W * SCREEN_SIZE.height) / SCREEN_SIZE.width);
const PAGE_SCALE = SCREEN_SIZE.width / (PAGE_W / 40);

function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className={className}>
      <path d="M16.6 5.82A4.28 4.28 0 0 1 15.54 3h-3.09v12.4a2.59 2.59 0 1 1-2.59-2.6c.27 0 .53.04.77.12V9.77a5.7 5.7 0 0 0-.77-.05A5.68 5.68 0 1 0 15.54 15.4V9.01a7.35 7.35 0 0 0 4.3 1.38V7.3a4.28 4.28 0 0 1-3.24-1.48Z" />
    </svg>
  );
}

function ThreadsIcon({ className }: { className?: string }) {
  return (
    <span aria-hidden className={`grid place-items-center font-display font-bold leading-none ${className ?? ""}`}>
      @
    </span>
  );
}

export type Network = "instagram" | "tiktok" | "threads";

const networks: Record<
  Network,
  { label: string; url: (h: string) => string; icon: React.ReactNode; bg: string; accent: string; cta: string }
> = {
  instagram: {
    label: "Instagram",
    url: (h) => `https://www.instagram.com/${h}/`,
    icon: <InstagramLogoIcon className="h-6 w-6" />,
    bg: "linear-gradient(160deg, #feda75 0%, #fa7e1e 22%, #d62976 50%, #962fbf 75%, #4f5bd5 100%)",
    accent: "#d62976",
    cta: "Follow on Instagram",
  },
  tiktok: {
    label: "TikTok",
    url: (h) => `https://www.tiktok.com/@${h}`,
    icon: <TikTokIcon className="h-6 w-6" />,
    bg: "radial-gradient(circle at 20% 15%, #25f4ee55, transparent 45%), radial-gradient(circle at 85% 80%, #fe2c5555, transparent 45%), #010101",
    accent: "#fe2c55",
    cta: "Follow on TikTok",
  },
  threads: {
    label: "Threads",
    url: (h) => `https://www.threads.net/@${h}`,
    icon: <ThreadsIcon className="h-6 w-6 text-2xl" />,
    bg: "linear-gradient(180deg, #1c1c1c 0%, #000 60%)",
    accent: "#ffffff",
    cta: "Follow on Threads",
  },
};

export default function SocialPhone({ network }: { network: Network }) {
  const handle = profile.socials[network];
  const n = networks[network];
  if (!handle) return null;
  return (
    <PhoneShell>
      <Html transform scale={PAGE_SCALE} zIndexRange={[5, 0]} pointerEvents="auto">
        <a
          href={n.url(handle)}
          target="_blank"
          rel="noreferrer"
          aria-label={`${profile.alias} on ${n.label}`}
          className="flex flex-col items-center overflow-hidden rounded-[28px] px-6 pb-8 pt-16 text-center text-white"
          style={{ width: PAGE_W, height: PAGE_H, background: n.bg }}
        >
          <span className="flex items-center gap-2 font-display text-lg font-semibold">
            {n.icon}
            {n.label}
          </span>

          {/* eslint-disable-next-line @next/next/no-img-element -- rendered inside a CSS3D transform */}
          <img
            src="/profile/avatar.jpg"
            alt=""
            className="mt-10 h-28 w-28 rounded-full border-4 border-white/80 object-cover shadow-xl"
          />
          <span className="mt-5 font-display text-2xl font-bold tracking-tight">{profile.alias}</span>
          <span className="mt-1 text-base text-white/85">@{handle}</span>
          <span className="mt-3 text-sm text-white/60">{profile.title} · Creator</span>

          <span
            className="mt-auto w-full rounded-2xl bg-white py-3 font-display text-base font-semibold transition-transform hover:scale-[1.03]"
            style={{ color: network === "threads" ? "#000" : n.accent }}
          >
            {n.cta} ↗
          </span>
        </a>
      </Html>
    </PhoneShell>
  );
}
