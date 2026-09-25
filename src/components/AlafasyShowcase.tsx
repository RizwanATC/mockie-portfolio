"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  Star,
  Download,
  ExternalLink,
  Bell,
  Compass,
  BookOpen,
  Music,
  Moon,
  Globe,
} from "lucide-react";

const screenshots = [
  { src: "/alafasy/screen-1.jpg", alt: "Prayer Times & Adhan" },
  { src: "/alafasy/screen-2.jpg", alt: "Qiblah Compass" },
  { src: "/alafasy/screen-3.jpg", alt: "Al-Quran Reader" },
  { src: "/alafasy/screen-4.jpg", alt: "Audio Playlist" },
  { src: "/alafasy/screen-5.jpg", alt: "Daily Dhikr" },
];

const features = [
  { icon: <Bell size={16} />, label: "Prayer Times & Adhan Alerts" },
  { icon: <Compass size={16} />, label: "High Precision Qiblah Compass" },
  { icon: <BookOpen size={16} />, label: "Dual Mode Quran (Mushaf + Translation)" },
  { icon: <Music size={16} />, label: "Audio Playlist by Sheikh Alafasy" },
  { icon: <Moon size={16} />, label: "Morning & Evening Dhikr Reminders" },
  { icon: <Globe size={16} />, label: "7 Languages Supported" },
];

const AUTOPLAY_INTERVAL = 3500;

export default function AlafasyShowcase() {
  const [active, setActive] = useState(0);
  const [direction, setDirection] = useState(1); // 1 = forward, -1 = backward
  const [paused, setPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const go = (index: number, dir: number) => {
    setDirection(dir);
    setActive(index);
  };

  const prev = () => go(active === 0 ? screenshots.length - 1 : active - 1, -1);
  const next = () => go(active === screenshots.length - 1 ? 0 : active + 1, 1);

  // Auto-play
  useEffect(() => {
    if (paused) return;
    timerRef.current = setInterval(() => {
      setDirection(1);
      setActive((i) => (i === screenshots.length - 1 ? 0 : i + 1));
    }, AUTOPLAY_INTERVAL);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [paused, active]);

  const slideVariants = {
    enter: (dir: number) => ({ x: dir > 0 ? "100%" : "-100%", opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? "-100%" : "100%", opacity: 0 }),
  };

  return (
    <section id="featured" className="py-20 px-6 relative overflow-hidden">
      {/* Background glows */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          animate={{ scale: [1, 1.1, 1], opacity: [0.08, 0.14, 0.08] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-emerald-600 rounded-full blur-3xl"
        />
        <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl" />
      </div>

      <div className="max-w-6xl mx-auto relative">
        {/* Main card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-sm overflow-hidden"
        >
          {/* Ribbon */}
          <div className="flex items-center justify-between px-8 py-3 border-b border-white/8 bg-emerald-500/5">
            <div className="flex items-center gap-2">
              <span className="text-emerald-300 text-xs font-semibold uppercase tracking-widest">Core Project</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400">CORE</span>
            </div>
            <span className="flex items-center gap-1.5 text-xs font-medium px-3 py-1 rounded-full bg-green-500/15 border border-green-500/25 text-green-400">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              Live on Play Store
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
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="flex items-center gap-4 mb-6"
                >
                  <div className="relative w-16 h-16 rounded-2xl overflow-hidden border border-white/10 shadow-lg flex-shrink-0">
                    <Image
                      src="/alafasy/icon.png"
                      alt="Alafasy App Icon"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white leading-tight">Alafasy</h3>
                    <p className="text-white/50 text-sm">Prayers & Al-Quran</p>
                  </div>
                </motion.div>

                {/* Stats row */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="flex flex-wrap gap-3 mb-6"
                >
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-sm font-medium">
                    <Star size={13} className="fill-yellow-400" />
                    4.6 / 5
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium">
                    <Download size={13} />
                    10,000+ installs
                  </div>
                  <Badge variant="default">Lifestyle</Badge>
                </motion.div>

                {/* Tags */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.35 }}
                  className="flex flex-wrap gap-2 mb-6"
                >
                  {["Java", "Android", "Riverlens Sdn Bhd", "Google Play"].map((t) => (
                    <Badge key={t} variant="outline" className="text-xs">{t}</Badge>
                  ))}
                </motion.div>

                {/* Description */}
                <motion.p
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                  className="text-white/55 text-sm leading-relaxed mb-8"
                >
                  An all-in-one Islamic app by Sheikh Mishary Rashid Alafasy —
                  built to serve Muslims worldwide with prayer times, Quran
                  reading, Qiblah compass, and audio recitations. I contributed
                  to the Android development at{" "}
                  <span className="text-white/80 font-medium">Riverlens Sdn Bhd</span>.
                </motion.p>

                {/* Features grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
                  {features.map((f, i) => (
                    <motion.div
                      key={f.label}
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: 0.45 + i * 0.06 }}
                      className="flex items-center gap-2.5 text-white/60 text-xs"
                    >
                      <span className="text-emerald-400 flex-shrink-0">{f.icon}</span>
                      {f.label}
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* CTA */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.8 }}
              >
                <a
                  href="https://play.google.com/store/apps/details?id=com.alafasy.app"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex"
                >
                  <Button className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-emerald-500/25 gap-2">
                    <ExternalLink size={15} />
                    View on Google Play
                  </Button>
                </a>
              </motion.div>
            </div>

            {/* Right — screenshot carousel */}
            <div
              className="relative bg-gradient-to-br from-emerald-950/40 to-teal-950/30 flex items-center justify-center p-8 min-h-[520px]"
              onMouseEnter={() => setPaused(true)}
              onMouseLeave={() => setPaused(false)}
            >
              {/* Phone frame */}
              <div className="relative">
                {/* Floating glow */}
                <motion.div
                  animate={{ scale: [1, 1.15, 1], opacity: [0.25, 0.45, 0.25] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute inset-0 bg-emerald-500 blur-2xl rounded-full scale-75 pointer-events-none"
                />

                {/* Floating phone wrapper */}
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
                  className="relative"
                >
                  {/* Phone shell */}
                  <div className="relative w-[210px] h-[440px] rounded-[2.8rem] border-2 border-white/25 bg-black shadow-2xl overflow-hidden">
                    {/* Status bar area */}
                    <div className="absolute top-0 left-0 right-0 h-8 bg-black/60 z-10 flex items-center justify-center">
                      <div className="w-20 h-5 bg-black rounded-full" />
                    </div>

                    {/* Sliding screenshots */}
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

                  {/* Side reflection */}
                  <div className="absolute -inset-[2px] rounded-[2.8rem] border border-white/10 pointer-events-none" />
                </motion.div>

                {/* Nav arrows */}
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={prev}
                  className="absolute left-[-52px] top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-white/10 border border-white/15 text-white/60 hover:text-white hover:bg-white/20 transition-colors"
                >
                  <ChevronLeft size={18} />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={next}
                  className="absolute right-[-52px] top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-white/10 border border-white/15 text-white/60 hover:text-white hover:bg-white/20 transition-colors"
                >
                  <ChevronRight size={18} />
                </motion.button>
              </div>

              {/* Dot indicators */}
              <div className="absolute bottom-6 flex gap-2 items-center">
                {screenshots.map((_, i) => (
                  <motion.button
                    key={i}
                    onClick={() => go(i, i > active ? 1 : -1)}
                    animate={{
                      width: i === active ? 24 : 8,
                      backgroundColor: i === active ? "rgb(52 211 153)" : "rgba(255,255,255,0.2)",
                    }}
                    transition={{ duration: 0.3 }}
                    className="h-2 rounded-full"
                  />
                ))}
              </div>

              {/* Screenshot label — fades between slides */}
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

              {/* Auto-play progress bar */}
              {!paused && (
                <div className="absolute bottom-[52px] left-8 right-8 h-px bg-white/10 overflow-hidden rounded-full">
                  <motion.div
                    key={active}
                    initial={{ scaleX: 0, originX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: AUTOPLAY_INTERVAL / 1000, ease: "linear" }}
                    className="h-full bg-emerald-400/50 origin-left"
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
