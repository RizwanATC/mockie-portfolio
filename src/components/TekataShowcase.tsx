"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Smartphone, Users, Clock, Star, Globe, Mic, Crown } from "lucide-react";

const screenshots = [
  { src: "/tekatagames/screen-1.jpg", alt: "Home Screen",        landscape: false },
  { src: "/tekatagames/screen-2.jpg", alt: "Category Selection", landscape: false },
  { src: "/tekatagames/screen-3.jpg", alt: "Gameplay",           landscape: false },
  { src: "/tekatagames/screen-4.jpg", alt: "Round Results",      landscape: false },
  { src: "/tekatagames/screen-5.jpg", alt: "Live Gameplay",      landscape: true  },
];

const features = [
  { icon: <Smartphone size={15} />,  label: "Hands-free tilt gameplay — no buttons needed" },
  { icon: <Star size={15} />,        label: "8 free Malaysian-themed categories" },
  { icon: <Users size={15} />,       label: "Multiplayer party gameplay" },
  { icon: <Clock size={15} />,       label: "60-second challenge rounds" },
  { icon: <Crown size={15} />,       label: "Premium decks: Malaysian Memes & Horror" },
  { icon: <Mic size={15} />,         label: "Optional gameplay recording" },
  { icon: <Globe size={15} />,       label: "English, Bahasa Malaysia & Chinese" },
];

const freeCategories = [
  "🍜 Malaysian Food", "🏛️ Famous Places", "🎭 Culture & Tradition",
  "⭐ Celebrities", "🏸 Malaysian Sports", "🌺 Flora & Fauna",
  "🎬 Film & TV", "💬 Malaysian Slang",
];

const AUTOPLAY_MS = 3500;

const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? "100%" : "-100%", opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit:  (dir: number) => ({ x: dir > 0 ? "-100%" : "100%", opacity: 0 }),
};

export default function TekataShowcase() {
  const [active, setActive]       = useState(0);
  const [direction, setDirection] = useState(1);
  const [paused, setPaused]       = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const go   = (idx: number, dir: number) => { setDirection(dir); setActive(idx); };
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
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-orange-500 rounded-full blur-3xl"
        />
        <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/10 rounded-full blur-3xl" />
      </div>

      <div className="max-w-6xl mx-auto relative">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-sm overflow-hidden"
        >
          {/* Top ribbon */}
          <div className="flex items-center justify-between px-8 py-3 border-b border-white/8 bg-orange-500/5">
            <span className="text-orange-300 text-xs font-semibold uppercase tracking-widest">
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
                {/* Identity */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.15 }}
                  className="flex items-center gap-4 mb-6"
                >
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center shadow-lg shadow-orange-500/30 flex-shrink-0 text-2xl select-none">
                    🎭
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white leading-tight">Tekata</h3>
                    <p className="text-white/50 text-sm">Malaysian Heads Up Party Game</p>
                  </div>
                </motion.div>

                {/* Tags */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.25 }}
                  className="flex flex-wrap gap-2 mb-6"
                >
                  {["Flutter", "Dart", "Game", "🇲🇾 Malaysia"].map(t => (
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
                  className="text-white/55 text-sm leading-relaxed mb-6"
                >
                  A fast-paced Malaysian heads up party game built for friends and family.
                  Place your phone on your forehead, let your friends give clues, and guess
                  the word before time runs out — tilt to answer, no buttons needed.
                  Featuring local culture, food, celebrities, slang, and more.
                </motion.p>

                {/* Features */}
                <div className="space-y-2.5 mb-6">
                  {features.map((f, i) => (
                    <motion.div
                      key={f.label}
                      initial={{ opacity: 0, x: -16 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: 0.35 + i * 0.05 }}
                      className="flex items-center gap-2.5 text-white/60 text-xs"
                    >
                      <span className="text-orange-400 flex-shrink-0">{f.icon}</span>
                      {f.label}
                    </motion.div>
                  ))}
                </div>

                {/* Free categories */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.7 }}
                >
                  <p className="text-white/30 text-xs uppercase tracking-widest mb-2">Free Categories</p>
                  <div className="flex flex-wrap gap-1.5">
                    {freeCategories.map(c => (
                      <span key={c} className="text-xs px-2 py-1 rounded-lg bg-orange-500/10 border border-orange-500/20 text-orange-300/80">
                        {c}
                      </span>
                    ))}
                  </div>
                </motion.div>
              </div>

            </div>

            {/* Right — carousel */}
            <div
              className="relative bg-gradient-to-br from-orange-950/40 to-red-950/30 flex items-center justify-center p-8 min-h-[520px]"
              onMouseEnter={() => setPaused(true)}
              onMouseLeave={() => setPaused(false)}
            >
              <div className="relative">
                {/* Glow pulse */}
                <motion.div
                  animate={{ scale: [1, 1.18, 1], opacity: [0.2, 0.4, 0.2] }}
                  transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute inset-0 bg-orange-500 blur-2xl rounded-full scale-75 pointer-events-none"
                />

                {/* Floating phone */}
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
                >
                  {/* Phone shell — morphs between portrait and landscape dimensions */}
                  <motion.div
                    layout
                    animate={{
                      width:  screenshots[active].landscape ? 420 : 210,
                      height: screenshots[active].landscape ? 210 : 440,
                      borderRadius: screenshots[active].landscape ? "1.5rem" : "2.8rem",
                    }}
                    transition={{ duration: 0.55, ease: [0.32, 0.72, 0, 1] }}
                    className="relative border-2 border-white/25 bg-black shadow-2xl overflow-hidden"
                  >
                    {/* Status bar — top for portrait, side for landscape */}
                    <div className="absolute top-0 left-0 right-0 h-7 bg-black/60 z-10 flex items-center justify-center">
                      <div className="w-16 h-4 bg-black rounded-full" />
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
                            sizes={screenshots[active].landscape ? "420px" : "210px"}
                            quality={95}
                            priority
                          />
                        </motion.div>
                      </AnimatePresence>
                    </div>

                    {/* Home indicator */}
                    <motion.div
                      animate={{
                        bottom: screenshots[active].landscape ? "50%" : 8,
                        right:  screenshots[active].landscape ? 8 : "50%",
                        translateX: screenshots[active].landscape ? 0 : "50%",
                        translateY: screenshots[active].landscape ? "50%" : 0,
                        width:  screenshots[active].landscape ? 4 : 56,
                        height: screenshots[active].landscape ? 28 : 4,
                      }}
                      transition={{ duration: 0.55, ease: [0.32, 0.72, 0, 1] }}
                      className="absolute bg-white/30 rounded-full z-10"
                    />
                  </motion.div>
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
                      backgroundColor: i === active ? "rgb(251 146 60)" : "rgba(255,255,255,0.2)",
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
                    className="px-3 py-1 rounded-full bg-black/50 border border-white/10 text-white/50 text-xs whitespace-nowrap flex items-center gap-1.5"
                  >
                    {screenshots[active].landscape && (
                      <span className="text-orange-400">↺</span>
                    )}
                    {screenshots[active].alt}
                    {screenshots[active].landscape && (
                      <span className="text-orange-400/60">· landscape</span>
                    )}
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
                    className="h-full bg-orange-400/50 origin-left"
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
