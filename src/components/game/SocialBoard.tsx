"use client";

import { useEffect, useState } from "react";
import { Html } from "@react-three/drei";
import { InstagramLogoIcon } from "@radix-ui/react-icons";
import { profile } from "@/data/resume";

// Title-screen notice boards: one wooden board per social network, with a live, clickable parchment pinned to it.

// Parchment size in world units; the board, posts and roof are built around it.
const SHEET_W = 1.9;
const SHEET_H = 2.5;
const SHEET_Y = 2.55; // centre height above the ground
// Page is laid out at this CSS width; drei's transform mode renders 40px per world unit, so scale to the sheet.
const PAGE_W = 300;
const PAGE_H = Math.round((PAGE_W * SHEET_H) / SHEET_W);
const PAGE_SCALE = SHEET_W / (PAGE_W / 40);

const BOARD_W = SHEET_W + 0.3;
const BOARD_H = SHEET_H + 0.3;
const TOP = SHEET_Y + BOARD_H / 2;
const POST_X = BOARD_W / 2 + 0.05;
const ROOF_TILT = 0.5;
const ROOF_LEN = (BOARD_W / 2 + 0.35) / Math.cos(ROOF_TILT);

function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
      className={className}
    >
      <path d="M16.6 5.82A4.28 4.28 0 0 1 15.54 3h-3.09v12.4a2.59 2.59 0 1 1-2.59-2.6c.27 0 .53.04.77.12V9.77a5.7 5.7 0 0 0-.77-.05A5.68 5.68 0 1 0 15.54 15.4V9.01a7.35 7.35 0 0 0 4.3 1.38V7.3a4.28 4.28 0 0 1-3.24-1.48Z" />
    </svg>
  );
}

function ThreadsIcon({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={`grid place-items-center font-display font-bold leading-none ${className ?? ""}`}
    >
      @
    </span>
  );
}

export type Network = "instagram" | "tiktok" | "threads";

// each network gets a heraldic colour for its banner and seal
const networks: Record<
  Network,
  {
    label: string;
    url: (h: string) => string;
    icon: React.ReactNode;
    colour: string;
    motto: string;
  }
> = {
  instagram: {
    label: "Instagram",
    url: (h) => `https://www.instagram.com/${h}/`,
    icon: <InstagramLogoIcon className="h-5 w-5" />,
    colour: "#9b1c3a",
    motto: "Portraits of the realm",
  },
  tiktok: {
    label: "TikTok",
    url: (h) => `https://www.tiktok.com/@${h}`,
    icon: <TikTokIcon className="h-5 w-5" />,
    colour: "#0f5c63",
    motto: "Tales in a heartbeat",
  },
  threads: {
    label: "Threads",
    url: (h) => `https://www.threads.net/@${h}`,
    icon: <ThreadsIcon className="h-5 w-5 text-xl" />,
    colour: "#2b2118",
    motto: "Word from the tavern",
  },
};

const WOOD = "#6b4226";
const WOOD_DARK = "#4a2c18";

function Board() {
  return (
    <group>
      {[-POST_X, POST_X].map((x) => (
        <mesh key={x} position={[x, (TOP + 0.1) / 2, -0.04]} castShadow>
          <boxGeometry args={[0.16, TOP + 0.1, 0.16]} />
          <meshStandardMaterial color={WOOD_DARK} roughness={0.9} />
        </mesh>
      ))}
      <mesh position={[0, SHEET_Y, -0.05]} castShadow>
        <boxGeometry args={[BOARD_W, BOARD_H, 0.08]} />
        <meshStandardMaterial color={WOOD} roughness={0.85} />
      </mesh>
      {/* little gable roof to keep the rain off */}
      {[-1, 1].map((s) => (
        <mesh
          key={s}
          position={[
            (s * (BOARD_W / 2 + 0.35)) / 2,
            TOP + 0.12 + (Math.tan(ROOF_TILT) * (BOARD_W / 2 + 0.35)) / 2,
            0,
          ]}
          rotation={[0, 0, -s * ROOF_TILT]}
          castShadow
        >
          <boxGeometry args={[ROOF_LEN, 0.08, 0.5]} />
          <meshStandardMaterial color="#8a3b2a" roughness={0.8} />
        </mesh>
      ))}
    </group>
  );
}

export default function SocialBoard({ network }: { network: Network }) {
  const handle = profile.socials[network];
  const n = networks[network];
  // Mount the parchment a frame after the board: a drei <Html> created while the scene is still settling can be torn
  // down mid-render ("synchronously unmount a root") and never come back.
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setReady(true));
    return () => cancelAnimationFrame(id);
  }, []);
  if (!handle) return null;
  return (
    <group>
      <Board />
      {ready && (
        <Html
          transform
          position={[0, SHEET_Y, 0.001]}
          scale={PAGE_SCALE}
          zIndexRange={[5, 0]}
          pointerEvents="auto"
        >
          <a
            href={n.url(handle)}
            target="_blank"
            rel="noreferrer"
            aria-label={`${profile.alias} on ${n.label}`}
            className="group relative flex flex-col items-center px-6 pb-6 pt-14 text-center"
            style={{
              width: PAGE_W,
              height: PAGE_H,
              color: "#3b2414",
              background:
                "radial-gradient(ellipse at 50% 40%, #f6e7c1 0%, #ecd49c 65%, #d9b676 100%)",
              boxShadow: "inset 0 0 36px rgba(110, 60, 20, 0.55)",
              clipPath:
                "polygon(0 2%, 6% 0, 30% 1.5%, 55% 0, 80% 1.2%, 100% 0, 99% 30%, 100% 62%, 98.5% 100%, 70% 98.5%, 40% 100%, 12% 98.8%, 0 100%, 1.2% 60%)",
            }}
          >
            {/* nails */}
            {[
              "left-3 top-3",
              "right-3 top-3",
              "bottom-3 left-3",
              "bottom-3 right-3",
            ].map((pos) => (
              <span
                key={pos}
                className={`absolute ${pos} h-2.5 w-2.5 rounded-full bg-[#5a5048] shadow-[inset_-1px_-1px_0_#2a241f]`}
              />
            ))}

            {/* banner with the network's name */}
            <span
              className="absolute left-1/2 top-4 flex -translate-x-1/2 items-center gap-2 px-5 py-1.5 font-medieval text-base font-extrabold tracking-wider text-[#f6e7c1]"
              style={{
                background: n.colour,
                clipPath:
                  "polygon(0 0, 100% 0, 94% 50%, 100% 100%, 0 100%, 6% 50%)",
              }}
            >
              {n.icon}
              {n.label}
            </span>

            <span className="mt-4 font-medieval text-[11px] font-semibold uppercase tracking-[0.3em] text-[#7a5530]">
              Hear ye, hear ye
            </span>

            {/* eslint-disable-next-line @next/next/no-img-element -- rendered inside a CSS3D transform */}
            <img
              src="/profile/avatar.jpg"
              alt=""
              className="mt-4 h-24 w-24 rounded-full object-cover"
              style={{
                border: "4px double #a8771f",
                boxShadow: "0 0 0 3px #ecd49c, 0 0 0 5px #7a5530",
              }}
            />
            <span className="mt-4 font-medieval text-2xl font-extrabold tracking-wide">
              {profile.alias}
            </span>
            <span className="mt-0.5 font-serif text-base italic text-[#6b4a2b]">
              @{handle}
            </span>
            <span className="mt-2 font-serif text-sm text-[#7a5530]">
              ~ {n.motto} ~
            </span>

            {/* wax seal button */}
            <span
              className="mt-auto flex w-full items-center justify-center gap-2 rounded-md py-2.5 font-medieval text-sm font-extrabold tracking-widest text-[#f6e7c1] shadow-[0_3px_0_rgba(0,0,0,0.35)] transition-transform group-hover:scale-[1.04]"
              style={{ background: n.colour }}
            >
              <span className="grid h-6 w-6 place-items-center rounded-full bg-[#b8322a] text-[10px] text-[#f6e7c1] shadow-[inset_0_0_0_2px_#8c1f19]">
                ✦
              </span>
              FOLLOW ↗
            </span>
          </a>
        </Html>
      )}
    </group>
  );
}
