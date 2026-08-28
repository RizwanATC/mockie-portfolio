"use client";

import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Briefcase, Tv2, GraduationCap } from "lucide-react";

const experiences = [
  {
    company: "Riverlens Sdn. Bhd.",
    role: "Native Android Developer",
    period: "Jan 2025 – Present",
    current: true,
    type: "work",
    color: "emerald",
    projects: [
      {
        name: "Alafasy (Main App)",
        points: [
          "Developed Android app from scratch using Kotlin, covering full SDLC from UI/UX to production deployment.",
          "Implemented MVVM architecture with Jetpack components for clean, scalable structure.",
          "Utilized Coroutines & Kotlin Flow/LiveData for async programming and reactive data handling.",
          "Integrated RESTful APIs via Retrofit — JSON parsing, auth flows, secure network communication.",
          "Implemented Room database for offline support and optimised data caching.",
          "Applied Hilt (DI) to improve modularity, testability, and scalability.",
          "Optimised battery efficiency, memory management, and background processing.",
        ],
      },
    ],
    tags: ["Kotlin", "MVVM", "Jetpack", "Coroutines", "Retrofit", "Room", "Hilt"],
  },
  {
    company: "Noor Luminous Sdn. Bhd.",
    role: "Native Android Developer",
    period: "Jun 2023 – Dec 2024",
    current: false,
    type: "work",
    color: "amber",
    projects: [
      {
        name: "TheNoor (Main App)",
        points: [
          "Implemented new features and maintained TheNoor app to design specs and user requirements.",
          "Identified and resolved bugs to enhance performance and UX.",
          "Transitioned from web-based to native mobile app architecture.",
          "Migrated Java codebase to Kotlin — null safety, coroutines, extension functions.",
          "Updated outdated libraries for improved security and functionality.",
        ],
      },
      {
        name: "TheNoor × Proton",
        points: [
          "Designed and developed a user-friendly automotive app for Proton with driver safety features.",
        ],
      },
      {
        name: "TheNoor × Huawei Car",
        points: [
          "Designed and developed a user-friendly automotive app for Huawei Car with driver safety features.",
        ],
      },
    ],
    tags: ["Kotlin", "Java", "Android", "Coroutines", "Automotive"],
  },
  {
    company: "Duogo Sdn. Bhd.",
    role: "Native Android Developer",
    period: "Jan 2022 – Jul 2022",
    current: false,
    type: "work",
    color: "indigo",
    projects: [
      {
        name: "Cashier & POS System",
        points: [
          "Developed and integrated discount features to enhance user engagement.",
          "Designed new cashier app flows, optimising opening/closing processes.",
          "Configured printer layout and enhanced item calculation including TAX & service charge.",
          "Maintained, updated and resolved bugs in existing applications.",
          "Proficient in Java, XML, and iBOXCHAIN systems.",
        ],
      },
    ],
    tags: ["Java", "XML", "iBOXCHAIN", "POS", "Android"],
  },
  {
    company: "ATX Sdn. Bhd.",
    role: "Native Android Developer",
    period: "Feb 2016 – Feb 2018",
    current: false,
    type: "work",
    color: "blue",
    projects: [
      {
        name: "MY PAY STATION & Park & Pay",
        points: [
          "Led MY PAY STATION project — enhanced design and backend, specialised in API configuration.",
          "Led Park & Pay project — developed Android app, introduced design layout and configured RESTful APIs.",
        ],
      },
    ],
    tags: ["Java", "Android", "RESTful API", "Payment"],
  },
  {
    company: "Meta (Facebook)",
    role: "Content Creator",
    period: "Mar 2018 – Dec 2021",
    current: false,
    type: "creator",
    color: "purple",
    projects: [
      {
        name: "Gaming & Content",
        points: [
          "Created and delivered daily gaming stream content to 105K followers.",
          "Cultivated a 105K-strong social media following, fostering active engagement.",
          "Edited and published video content across platforms, yielding a 10% increase in audience reach.",
          "Entertained and engaged viewers from around the globe.",
        ],
      },
    ],
    tags: ["Content Creation", "Live Streaming", "Video Editing", "105K Followers"],
  },
];

const education = {
  degree: "Diploma in Computer Networking",
  school: "Kolej Professional MARA, Indera Mahkota",
  cgpa: "CGPA: 3.2",
};

const colorMap: Record<string, { dot: string; line: string; tag: string; glow: string }> = {
  emerald: { dot: "bg-emerald-400", line: "border-emerald-400/30", tag: "bg-emerald-500/10 text-emerald-300 border-emerald-500/20", glow: "shadow-emerald-500/10" },
  amber:   { dot: "bg-amber-400",   line: "border-amber-400/30",   tag: "bg-amber-500/10 text-amber-300 border-amber-500/20",     glow: "shadow-amber-500/10" },
  indigo:  { dot: "bg-indigo-400",  line: "border-indigo-400/30",  tag: "bg-indigo-500/10 text-indigo-300 border-indigo-500/20",   glow: "shadow-indigo-500/10" },
  blue:    { dot: "bg-blue-400",    line: "border-blue-400/30",    tag: "bg-blue-500/10 text-blue-300 border-blue-500/20",         glow: "shadow-blue-500/10" },
  purple:  { dot: "bg-purple-400",  line: "border-purple-400/30",  tag: "bg-purple-500/10 text-purple-300 border-purple-500/20",   glow: "shadow-purple-500/10" },
};

export default function Experience() {
  return (
    <section id="experience" className="py-24 px-6 relative">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <p className="text-indigo-400 text-sm font-semibold uppercase tracking-widest mb-3">Experience</p>
          <h2 className="text-3xl md:text-4xl font-bold text-white">Where I&apos;ve worked</h2>
          <p className="text-white/40 mt-4 max-w-lg mx-auto text-sm">
            5+ years shipping Android apps across Islamic tech, fintech, automotive, and payment industries.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-[1fr_2fr] gap-12">

          {/* Left — education + quick facts */}
          <div className="space-y-5">
            {/* Education card */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="rounded-2xl border border-white/10 bg-white/[0.03] p-6"
            >
              <div className="flex items-center gap-2 mb-4">
                <GraduationCap size={16} className="text-indigo-400" />
                <p className="text-white/40 text-xs uppercase tracking-widest">Education</p>
              </div>
              <p className="text-white font-semibold text-sm">{education.degree}</p>
              <p className="text-white/50 text-xs mt-1">{education.school}</p>
              <p className="text-indigo-400 text-xs mt-1 font-medium">{education.cgpa}</p>
            </motion.div>

            {/* Training */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.08 }}
              className="rounded-2xl border border-white/10 bg-white/[0.03] p-6"
            >
              <div className="flex items-center gap-2 mb-4">
                <Briefcase size={16} className="text-purple-400" />
                <p className="text-white/40 text-xs uppercase tracking-widest">Training</p>
              </div>
              <p className="text-white text-sm font-medium">Unreal Engine Training</p>
              <p className="text-white/40 text-xs mt-1">August 2024</p>
            </motion.div>

            {/* Soft skills */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.14 }}
              className="rounded-2xl border border-white/10 bg-white/[0.03] p-6"
            >
              <div className="flex items-center gap-2 mb-4">
                <Tv2 size={16} className="text-cyan-400" />
                <p className="text-white/40 text-xs uppercase tracking-widest">Soft Skills</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {["Communication", "Problem Solving", "Flexibility", "Adaptability", "Empathy", "Continuous Learning", "Attention to Detail"].map(s => (
                  <span key={s} className="text-xs px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-white/60">{s}</span>
                ))}
              </div>
            </motion.div>

            {/* Languages */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="rounded-2xl border border-white/10 bg-white/[0.03] p-6"
            >
              <p className="text-white/40 text-xs uppercase tracking-widest mb-3">Languages</p>
              <div className="flex gap-2">
                {["🇲🇾 Bahasa Malaysia", "🇬🇧 English"].map(l => (
                  <span key={l} className="text-xs px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-white/70">{l}</span>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Right — timeline */}
          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-[7px] top-2 bottom-2 w-px bg-white/8" />

            <div className="space-y-10">
              {experiences.map((exp, i) => {
                const c = colorMap[exp.color];
                return (
                  <motion.div
                    key={exp.company}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: i * 0.07 }}
                    className="relative pl-8"
                  >
                    {/* Dot */}
                    <div className={`absolute left-0 top-1.5 w-3.5 h-3.5 rounded-full border-2 border-[#08080f] ${c.dot} ${exp.current ? "ring-2 ring-offset-1 ring-offset-[#08080f] ring-emerald-400/50" : ""}`} />

                    {/* Card */}
                    <div className={`rounded-2xl border border-white/10 bg-white/[0.03] p-6 shadow-lg ${c.glow}`}>
                      {/* Header */}
                      <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-white font-semibold">{exp.company}</h3>
                            {exp.current && (
                              <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-500/15 border border-green-500/25 text-green-400">
                                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                                Current
                              </span>
                            )}
                          </div>
                          <p className="text-white/50 text-sm">{exp.role}</p>
                        </div>
                        <span className="text-white/30 text-xs font-mono bg-white/5 px-3 py-1 rounded-full border border-white/8 whitespace-nowrap">
                          {exp.period}
                        </span>
                      </div>

                      {/* Projects */}
                      <div className="space-y-4 mb-4">
                        {exp.projects.map(proj => (
                          <div key={proj.name}>
                            <p className="text-sm font-medium text-white/80 mb-2">{proj.name}</p>
                            <ul className="space-y-1.5">
                              {proj.points.map((pt, j) => (
                                <li key={j} className="flex gap-2 text-xs text-white/50 leading-relaxed">
                                  <span className={`mt-1.5 w-1 h-1 rounded-full flex-shrink-0 ${c.dot}`} />
                                  {pt}
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-1.5">
                        {exp.tags.map(tag => (
                          <span key={tag} className={`text-[11px] px-2 py-0.5 rounded-full border ${c.tag}`}>{tag}</span>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
