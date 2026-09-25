"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Timer,
  Wallet,
  BarChart2,
  CalendarClock,
  History,
  Moon,
  Flag,
  ExternalLink,
} from "lucide-react";

const screenshots = [
  { src: "/gajimeter/screen-1.jpg", alt: "Live Salary Tracker" },
  { src: "/gajimeter/screen-2.jpg", alt: "Expense Manager" },
  { src: "/gajimeter/screen-3.jpg", alt: "Monthly Budget Overview" },
  { src: "/gajimeter/screen-4.jpg", alt: "Payday Countdown" },
  { src: "/gajimeter/screen-5.jpg", alt: "Work Session History" },
];

const features = [
  { icon: <Timer size={15} />,       label: "Live Salary Tracker — second by second" },
  { icon: <Wallet size={15} />,      label: "Expense Manager for fixed monthly bills" },
  { icon: <BarChart2 size={15} />,   label: "50/30/20 Budget Overview" },
  { icon: <CalendarClock size={15} />, label: "Payday Countdown" },
  { icon: <History size={15} />,     label: "Work Session History" },
  { icon: <Moon size={15} />,        label: "Dark & Light Mode" },
  { icon: <Flag size={15} />,        label: "6 Malaysian regional dialects" },
];

const AUTOPLAY_MS = 3500;

const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? "100%" : "-100%", opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit:  (dir: number) => ({ x: dir > 0 ? "-100%" : "100%", opacity: 0 }),
};

export default function GajiMeterShowcase() {
  const [active, setActive]     = useState(0);
  const [direction, setDirection] = useState(1);
  const [paused, setPaused]     = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const go = (index: number, dir: number) => { setDirection(dir); setActive(index); };
  const prev = () => go(active === 0 ? screenshots.length - 1 : active - 1, -1);
  const next = () => go(active === screenshots.length - 1 ? 0 : active + 1, 1);

  useEffect(() => {
    if (paused) return;
    timerRef.current = setInterval(() => {
      setDirection(1);
      setActive(i => (i === screenshots.length - 1 ? 0 : i + 1));
    }, AUTOPLAY_MS);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [paused, active]);

  return (
    <section className="py-10 px-6 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          animate={{ scale: [1, 1.12, 1], opacity: [0.07, 0.13, 0.07] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-violet-600 rounded-full blur-3xl"
        />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-fuchsia-500/10 rounded-full blur-3xl" />
      </div>

      <div className="max-w-6xl mx-auto relative">
        {/* Main card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-sm overflow-hidden"
        >
          {/* "Closed Beta" top ribbon */}
          <div className="flex items-center justify-between px-8 py-3 border-b border-white/8 bg-violet-500/5">
            <span className="text-violet-300 text-xs font-semibold uppercase tracking-widest">
              My Project
            </span>
            <span className="flex items-center gap-1.5 text-xs font-medium px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/25 text-amber-400">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              Closed Beta
            </span>
          </div>

          <div className="grid lg:grid-cols-2 gap-0">

            {/* Left — info */}
            <div className="p-8 md:p-12 flex flex-col justify-between">
              <div>
                {/* App identity */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.15 }}
                  className="flex items-center gap-4 mb-6"
                >
                  {/* Icon placeholder — swap for real icon when available */}
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-600 to-fuchsia-600 flex items-center justify-center shadow-lg shadow-violet-500/30 flex-shrink-0">
                    <Wallet size={28} className="text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white leading-tight">GajiMeter</h3>
                    <p className="text-white/50 text-sm">Real-time Salary & Expense Tracker</p>
                  </div>
                </motion.div>

                {/* Badges */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.25 }}
                  className="flex flex-wrap gap-2 mb-6"
                >
                  {["Flutter", "Dart", "Finance", "🇲🇾 Malaysia"].map(t => (
                    <Badge key={t} variant="secondary" className="text-xs">{t}</Badge>
                  ))}
                  <Badge variant="outline" className="text-xs">Google Play</Badge>
                </motion.div>

                {/* Description */}
                <motion.p
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="text-white/55 text-sm leading-relaxed mb-8"
                >
                  A real-time salary and expense tracker built specifically for Malaysian
                  workers. Know exactly how much you&apos;ve earned today, manage your
                  monthly expenses, and stay on top of your budget — all in one place.
                </motion.p>

                {/* Features */}
                <div className="space-y-2.5 mb-8">
                  {features.map((f, i) => (
                    <motion.div
                      key={f.label}
                      initial={{ opacity: 0, x: -16 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: 0.35 + i * 0.06 }}
                      className="flex items-center gap-2.5 text-white/60 text-xs"
                    >
                      <span className="text-violet-400 flex-shrink-0">{f.icon}</span>
                      {f.label}
                    </motion.div>
                  ))}
                </div>
              </div>

            </div>

            {/* Right — screenshot carousel */}
            <div
              className="relative bg-gradient-to-br from-violet-950/40 to-fuchsia-950/30 flex items-center justify-center p-8 min-h-[520px]"
              onMouseEnter={() => setPaused(true)}
              onMouseLeave={() => setPaused(false)}
            >
              <div className="relative">
                {/* Glow */}
                <motion.div
                  animate={{ scale: [1, 1.18, 1], opacity: [0.2, 0.4, 0.2] }}
                  transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute inset-0 bg-violet-500 blur-2xl rounded-full scale-75 pointer-events-none"
                />

                {/* Floating phone */}
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
                >
                  <div className="relative w-[210px] h-[440px] rounded-[2.8rem] border-2 border-white/25 bg-black shadow-2xl overflow-hidden">
                    {/* Status bar */}
                    <div className="absolute top-0 left-0 right-0 h-8 bg-black/60 z-10 flex items-center justify-center">
                      <div className="w-20 h-5 bg-black rounded-full" />
                    </div>

                    {/* Slides */}
                    <div className="w-full h-full relative overflow-hidden">
                      <AnimatePresence custom={direction} mode="popLayout">
                        <motion.div
                          key={active}
                          custom={direction}
                          variants={slideVariants}
                          initial="enter"
                          animate="center"
                          exit="exit"
                          transition={{ duration: 0.45, ease: [0.32, 0.72, 0, 1] }}
                          className="absolute inset-0"
                        >
                          <Image
                            src={screenshots[active].src}
                            alt={screenshots[active].alt}
                            fill
                            className="object-cover"
                            sizes="210px"
                            priority
                          />
                        </motion.div>
                      </AnimatePresence>
                    </div>

                    {/* Home indicator */}
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-14 h-1 bg-white/30 rounded-full z-10" />
                  </div>
                </motion.div>

                {/* Arrows */}
                <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}
                  onClick={prev}
                  className="absolute left-[-52px] top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-white/10 border border-white/15 text-white/60 hover:text-white hover:bg-white/20 transition-colors"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
                </motion.button>
                <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}
                  onClick={next}
                  className="absolute right-[-52px] top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-white/10 border border-white/15 text-white/60 hover:text-white hover:bg-white/20 transition-colors"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
                </motion.button>
              </div>

              {/* Dots */}
              <div className="absolute bottom-6 flex gap-2 items-center">
                {screenshots.map((_, i) => (
                  <motion.button
                    key={i}
                    onClick={() => go(i, i > active ? 1 : -1)}
                    animate={{
                      width: i === active ? 24 : 8,
                      backgroundColor: i === active ? "rgb(167 139 250)" : "rgba(255,255,255,0.2)",
                    }}
                    transition={{ duration: 0.3 }}
                    className="h-2 rounded-full"
                  />
                ))}
              </div>

              {/* Slide label */}
              <div className="absolute top-6 left-1/2 -translate-x-1/2">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={active}
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 6 }}
                    transition={{ duration: 0.25 }}
                    className="px-3 py-1 rounded-full bg-black/50 border border-white/10 text-white/50 text-xs whitespace-nowrap"
                  >
                    {screenshots[active].alt}
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Progress bar */}
              {!paused && (
                <div className="absolute bottom-[52px] left-8 right-8 h-px bg-white/10 overflow-hidden rounded-full">
                  <motion.div
                    key={active}
                    initial={{ scaleX: 0, originX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: AUTOPLAY_MS / 1000, ease: "linear" }}
                    className="h-full bg-violet-400/50 origin-left"
                  />
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
