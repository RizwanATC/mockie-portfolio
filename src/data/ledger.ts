// Content for the plain view (the readable résumé page), moved out of the old section components.
// The 3D world reads src/data/resume.ts; keep facts in both in step.

export type Job = {
  company: string;
  role: string;
  period: string;
  current?: boolean;
  projects: { name: string; points: string[] }[];
  tags: string[];
};

export const intro =
  "Native Android developer building production apps used by over a million people, with a focus on Kotlin, MVVM and modern Android. Currently at Riverlens Sdn. Bhd. on the Alafasy app; before that I built TheNoor at Noor Luminous, an Islamic lifestyle app with 1M+ installs. I bridge clean architecture with intuitive UI and UX.";

export const jobs: Job[] = [
  {
    company: "Riverlens Sdn. Bhd.",
    role: "Native Android Developer",
    period: "Jan 2025 – Present",
    current: true,
    projects: [
      {
        name: "Alafasy (main app)",
        points: [
          "Developed the Android app from scratch in Kotlin, covering the full SDLC from UI/UX to production deployment.",
          "Implemented MVVM architecture with Jetpack components for a clean, scalable structure.",
          "Used Coroutines and Kotlin Flow/LiveData for async programming and reactive data handling.",
          "Integrated RESTful APIs via Retrofit: JSON parsing, auth flows and secure network communication.",
          "Implemented a Room database for offline support and optimised data caching.",
          "Applied Hilt (DI) to improve modularity, testability and scalability.",
          "Optimised battery efficiency, memory management and background processing.",
        ],
      },
    ],
    tags: ["Kotlin", "MVVM", "Jetpack", "Coroutines", "Retrofit", "Room", "Hilt"],
  },
  {
    company: "Noor Luminous Sdn. Bhd.",
    role: "Native Android Developer",
    period: "Jun 2023 – Dec 2024",
    projects: [
      {
        name: "TheNoor (main app)",
        points: [
          "Implemented new features and maintained TheNoor to design specs and user requirements.",
          "Identified and resolved bugs to improve performance and UX.",
          "Moved the app from a web-based to a native mobile architecture.",
          "Migrated the Java codebase to Kotlin: null safety, coroutines, extension functions.",
          "Updated outdated libraries for better security and functionality.",
        ],
      },
      {
        name: "TheNoor for Proton",
        points: ["Designed and developed a user-friendly automotive app for Proton with driver safety features."],
      },
      {
        name: "TheNoor for Huawei Car",
        points: ["Designed and developed a user-friendly automotive app for Huawei Car with driver safety features."],
      },
    ],
    tags: ["Kotlin", "Java", "Android", "Coroutines", "Automotive"],
  },
  {
    company: "Duogo Sdn. Bhd.",
    role: "Native Android Developer",
    period: "Jan 2022 – Jul 2022",
    projects: [
      {
        name: "Cashier and POS system",
        points: [
          "Developed and integrated discount features to improve user engagement.",
          "Designed new cashier app flows, streamlining the opening and closing process.",
          "Configured printer layouts and improved item calculation, including tax and service charge.",
          "Maintained, updated and fixed bugs in existing applications.",
          "Worked across Java, XML and iBOXCHAIN systems.",
        ],
      },
    ],
    tags: ["Java", "XML", "iBOXCHAIN", "POS", "Android"],
  },
  {
    company: "Meta (Facebook)",
    role: "Content Creator",
    period: "Mar 2018 – Dec 2021",
    projects: [
      {
        name: "Gaming and content",
        points: [
          "Created and delivered daily gaming streams to 105K followers.",
          "Built a 105K-strong social following and kept it actively engaged.",
          "Edited and published video across platforms, growing audience reach by 10%.",
          "Entertained and engaged viewers from around the world.",
        ],
      },
    ],
    tags: ["Content creation", "Live streaming", "Video editing"],
  },
  {
    company: "ATX Sdn. Bhd.",
    role: "Native Android Developer",
    period: "Feb 2016 – Feb 2018",
    projects: [
      {
        name: "MY PAY STATION and Park & Pay",
        points: [
          "Led MY PAY STATION: improved the design and backend, specialising in API configuration.",
          "Led Park & Pay: developed the Android app, introduced the design layout and configured RESTful APIs.",
        ],
      },
    ],
    tags: ["Java", "Android", "RESTful API", "Payments"],
  },
];

export const education = {
  degree: "Diploma in Computer Networking",
  school: "Kolej Professional MARA, Indera Mahkota",
  grade: "CGPA 3.2",
};

export const sideProjects = [
  {
    title: "WalletApps",
    description:
      "A cross-platform Flutter finance app for net salary calculation, KWSP contribution estimates and budget planning. Runs on Android, iOS, web and desktop.",
    tags: ["Flutter", "Dart", "Finance"],
    github: "https://github.com/RizwanATC/walletapps",
  },
  {
    title: "AI Team Stats",
    description:
      "A TypeScript web app that tracks YouTube channel analytics for the Malaysian creator collective AI Team. Built with Next.js and deployed on Vercel.",
    tags: ["Next.js", "TypeScript", "YouTube API"],
    github: "https://github.com/RizwanATC/ai-team-stats",
  },
  {
    title: "GajiMeter Salary",
    description:
      "A Flutter salary meter for Malaysian employees to work out take-home pay after EPF, SOCSO and other statutory deductions.",
    tags: ["Flutter", "Dart", "Malaysia"],
    github: "https://github.com/RizwanATC/GajiMeterSalary",
  },
  {
    title: "Emraz Apps",
    description: "An early native Android app in Java and Android Studio, covering the core of Android development including Gradle builds.",
    tags: ["Java", "Android", "Gradle"],
    github: "https://github.com/RizwanATC/emraz_apps",
  },
  {
    title: "Time Sheet Management",
    description: "A Java Android app for tracking work hours and employee attendance.",
    tags: ["Java", "Android", "Productivity"],
    github: "https://github.com/RizwanATC/time_sheet_management",
  },
  {
    title: "Portfolio & Resume",
    description: "A Flutter app that presents personal projects, skills and work history as a mobile portfolio.",
    tags: ["Flutter", "Dart", "Portfolio"],
    github: "https://github.com/RizwanATC/portfolio_resume2",
  },
];

export const skillGroups = [
  { title: "Mobile", skills: ["Kotlin", "Java (Android)", "Flutter", "Dart", "Jetpack", "Coroutines", "Hilt", "Room", "Retrofit", "Material Design"] },
  { title: "Web", skills: ["Next.js", "TypeScript", "JavaScript", "React", "Tailwind CSS", "Vercel"] },
  { title: "Design", skills: ["Figma", "Prototyping", "Wireframing", "User research", "Design systems"] },
  { title: "Tools", skills: ["Git", "GitHub Actions", "Gradle", "Firebase", "REST APIs", "PostgreSQL"] },
];

// How each shipped app is introduced on the plain page (screens and links come from `apps` in resume.ts).
export const appNotes: Record<string, { blurb: string; facts: string[] }> = {
  thenoor: { blurb: "Solat times, azan and qibla.", facts: ["1M+ installs"] },
  alafasy: { blurb: "Prayers and the Al-Quran.", facts: ["Rated 4.6"] },
  gajimeter: { blurb: "A live salary and expense tracker.", facts: ["Flutter"] },
  tekata: { blurb: "A tilt-to-play party game.", facts: ["Flutter"] },
};
