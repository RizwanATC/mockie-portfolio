"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { GitHubLogoIcon, TwitterLogoIcon, LinkedInLogoIcon } from "@radix-ui/react-icons";
import { ArrowDown, Smartphone, Palette, Star, Download, FileText } from "lucide-react";

// ── phone data ──────────────────────────────────────────────────────────────
const phones = [
  {
    id: "thenoor",
    name: "TheNoor",
    sub: "Solat · Azan · Qibla",
    icon: "/thenoor/icon.png",
    screens: ["/thenoor/screen-1.jpg", "/thenoor/screen-2.jpg", "/thenoor/screen-3.jpg", "/thenoor/screen-4.jpg"],
    glow: "#d4a017",
    badge: "1M+ installs",
    badgeIcon: <Download size={11} />,
    core: true,
    rotate: -10,
    scale: 0.93,
    zIndex: 20,
    offsetX: -120,
  },
  {
    id: "alafasy",
    name: "Alafasy",
    sub: "Prayers & Al-Quran",
    icon: "/alafasy/icon.png",
    screens: ["/alafasy/screen-1.jpg", "/alafasy/screen-2.jpg", "/alafasy/screen-3.jpg", "/alafasy/screen-4.jpg", "/alafasy/screen-5.jpg"],
    glow: "#10b981",
    badge: "4.6 ★",
    badgeIcon: <Star size={11} className="fill-current" />,
    core: true,
    rotate: 10,
    scale: 0.93,
    zIndex: 20,
    offsetX: 120,
  },
];

// ── per-phone cycling hook ───────────────────────────────────────────────────
function useScreenCycle(screens: string[], intervalMs: number, offset = 0) {
  const [idx, setIdx] = useState(offset % screens.length);
  useEffect(() => {
    const t = setInterval(() => setIdx(i => (i + 1) % screens.length), intervalMs);
    return () => clearInterval(t);
  }, [screens.length, intervalMs]);
  return idx;
}

function PhoneCard({ phone, delay }: { phone: typeof phones[0]; delay: number }) {
  const idx = useScreenCycle(phone.screens, 3200 + delay * 400, delay);

  return (
    <motion.div
      initial={{ opacity: 0, y: 60 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay: 0.3 + delay * 0.12, ease: [0.22, 1, 0.36, 1] }}
      style={{ zIndex: phone.zIndex, x: phone.offsetX }}
      className="absolute"
    >
      {/* Floating animation */}
      <motion.div
        animate={{ y: [0, delay % 2 === 0 ? -12 : -8, 0] }}
        transition={{ duration: 3.5 + delay * 0.4, repeat: Infinity, ease: "easeInOut" }}
      >
        {/* Tilt */}
        <motion.div style={{ rotate: phone.rotate, scale: phone.scale }}>
          {/* Glow */}
          <div
            className="absolute inset-0 rounded-full blur-2xl opacity-40 scale-90 pointer-events-none"
            style={{ background: phone.glow }}
          />

          {/* Phone shell */}
          <div className="relative w-[150px] h-[310px] rounded-[2.2rem] border-2 border-white/20 bg-black shadow-2xl overflow-hidden">
            {/* Notch */}
            <div className="absolute top-0 left-0 right-0 h-6 bg-black/70 z-10 flex items-center justify-center">
              <div className="w-12 h-3.5 bg-black rounded-full" />
            </div>

            {/* Screen */}
            <div className="absolute inset-0 overflow-hidden">
              <AnimatePresence mode="popLayout">
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, scale: 1.04 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.5 }}
                  className="absolute inset-0"
                >
                  <Image
                    src={phone.screens[idx]}
                    alt={phone.name}
                    fill
                    className="object-cover"
                    sizes="150px"
                    quality={85}
                  />
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Home bar */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-10 h-1 bg-white/30 rounded-full z-10" />
          </div>

          {/* App label card */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 + delay * 0.12 }}
            className="absolute -bottom-14 left-1/2 -translate-x-1/2 w-[150px]"
          >
            <div
              className="rounded-xl border border-white/10 bg-black/70 backdrop-blur-sm px-3 py-2 flex items-center gap-2"
              style={{ boxShadow: `0 0 20px ${phone.glow}22` }}
            >
              {phone.icon ? (
                <div className="relative w-6 h-6 rounded-md overflow-hidden flex-shrink-0">
                  <Image src={phone.icon} alt={phone.name} fill className="object-cover" sizes="24px" />
                </div>
              ) : (
                <div
                  className="w-6 h-6 rounded-md flex-shrink-0"
                  style={{ background: `linear-gradient(135deg, ${phone.glow}, ${phone.glow}88)` }}
                />
              )}
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className="text-white text-[11px] font-semibold leading-none truncate">{phone.name}</p>
                  {phone.core && (
                    <span
                      className="text-[9px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0"
                      style={{ background: `${phone.glow}33`, color: phone.glow }}
                    >
                      CORE
                    </span>
                  )}
                </div>
                <p className="text-white/40 text-[9px] mt-0.5 truncate">{phone.sub}</p>
              </div>
            </div>

            {/* Stat badge */}
            <div
              className="mt-1.5 mx-auto w-fit flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full border"
              style={{
                color: phone.glow,
                borderColor: `${phone.glow}40`,
                background: `${phone.glow}15`,
              }}
            >
              {phone.badgeIcon}
              {phone.badge}
            </div>
          </motion.div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

// ── Hero ─────────────────────────────────────────────────────────────────────
export default function Hero() {
  const scrollTo = (href: string) => document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden px-6">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage: "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto w-full grid lg:grid-cols-2 gap-16 items-center min-h-screen py-28">

        {/* ── Left — text ── */}
        <div>
          {/* Avatar */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-4 mb-8"
          >
            <div className="relative flex-shrink-0">
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 blur-md opacity-50 scale-110" />
              <div className="relative w-14 h-14 rounded-full overflow-hidden border-2 border-white/20 shadow-xl">
                <Image src="/profile/avatar.jpg" alt="Rizwan" fill className="object-cover" sizes="56px" priority />
              </div>
              <div className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-green-400 border-2 border-[#08080f]" />
            </div>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-sm font-medium">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              Available for work
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.08 }}
            className="text-5xl md:text-6xl font-bold text-white mb-5 leading-tight"
          >
            Hi, I&apos;m{" "}
            <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
              Rizwan
            </span>
            <br />
            <span className="text-white/70 text-3xl md:text-4xl font-semibold">aka Mockie</span>
          </motion.h1>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.16 }}
            className="flex flex-wrap gap-3 mb-6"
          >
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-white/70 text-sm">
              <Smartphone size={14} className="text-indigo-400" />
              Mobile Developer
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-white/70 text-sm">
              <Palette size={14} className="text-purple-400" />
              UI/UX Designer
            </div>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.22 }}
            className="text-white/50 text-lg leading-relaxed mb-8 max-w-md"
          >
            Native Android Developer with 5+ years shipping production apps.
            Proficient in Kotlin, Flutter, MVVM, and modern Android architecture.
            Based in Selangor, Malaysia.
          </motion.p>

          {/* Quick stats */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.28 }}
            className="flex flex-wrap gap-4 mb-10"
          >
            {[
              { value: "1M+",   label: "Downloads" },
              { value: "2",     label: "Live Apps" },
              { value: "4.4★", label: "Avg Rating" },
            ].map(s => (
              <div key={s.label} className="text-center">
                <div className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">{s.value}</div>
                <div className="text-white/40 text-xs">{s.label}</div>
              </div>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.34 }}
            className="flex flex-wrap gap-4 mb-10"
          >
            <Button size="lg" onClick={() => scrollTo("#featured")}>View My Work</Button>
            <Button size="lg" variant="outline" onClick={() => scrollTo("#contact")}>Get in Touch</Button>
            <a href="/resume/resume.pdf" download>
              <Button size="lg" variant="outline" className="gap-2">
                <FileText size={16} />
                Resume
              </Button>
            </a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex gap-3"
          >
            {[
              { href: "https://github.com/RizwanATC",                  icon: <GitHubLogoIcon className="w-5 h-5" /> },
              { href: "https://x.com/rizwanmatnawi",                  icon: <TwitterLogoIcon className="w-5 h-5" /> },
              { href: "https://linkedin.com/in/rizwanmatnawi/",        icon: <LinkedInLogoIcon className="w-5 h-5" /> },
            ].map(s => (
              <a
                key={s.href}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 rounded-xl bg-white/5 border border-white/10 text-white/50 hover:text-white hover:bg-white/10 transition-all duration-200"
              >
                {s.icon}
              </a>
            ))}
          </motion.div>
        </div>

        {/* ── Right — three floating phones ── */}
        <div className="relative h-[520px] flex items-center justify-center hidden lg:flex">
          {phones.map((phone, i) => (
            <PhoneCard key={phone.id} phone={phone} delay={i} />
          ))}
        </div>
      </div>

      {/* Scroll hint */}
      <button
        onClick={() => scrollTo("#about")}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 text-white/30 hover:text-white/60 transition-colors animate-bounce z-10"
      >
        <ArrowDown size={22} />
      </button>
    </section>
  );
}
