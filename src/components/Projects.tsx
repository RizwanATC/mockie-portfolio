import { GitHubLogoIcon } from "@radix-ui/react-icons";
import { ExternalLink } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const projects = [
  {
    title: "WalletApps",
    description:
      "A cross-platform Flutter finance app for net salary calculation, KWSP contribution estimates, and budget planning. Supports Android, iOS, Web, and Desktop.",
    tags: ["Flutter", "Dart", "Finance", "Cross-platform"],
    github: "https://github.com/RizwanATC/walletapps",
    variant: "default" as const,
    gradient: "from-indigo-500/10 to-purple-500/10",
    border: "hover:border-indigo-500/30",
  },
  {
    title: "AI Team Stats",
    description:
      "A TypeScript web app that tracks YouTube channel analytics for the Malaysian creator collective 'AI Team'. Built with Next.js and deployed on Vercel.",
    tags: ["Next.js", "TypeScript", "Tailwind CSS", "Vercel", "YouTube API"],
    github: "https://github.com/RizwanATC/ai-team-stats",
    variant: "cyan" as const,
    gradient: "from-cyan-500/10 to-blue-500/10",
    border: "hover:border-cyan-500/30",
  },
  {
    title: "GajiMeter Salary",
    description:
      "A Flutter salary meter app for Malaysian employees to track and calculate their take-home pay, EPF, SOCSO, and other statutory deductions.",
    tags: ["Flutter", "Dart", "Salary Calculator", "Malaysia"],
    github: "https://github.com/RizwanATC/GajiMeterSalary",
    variant: "secondary" as const,
    gradient: "from-purple-500/10 to-pink-500/10",
    border: "hover:border-purple-500/30",
  },
  {
    title: "Emraz Apps",
    description:
      "A native Android application built with Java and Android Studio. An early project demonstrating core Android development skills including Gradle build systems.",
    tags: ["Java", "Android", "Gradle", "Android Studio"],
    github: "https://github.com/RizwanATC/emraz_apps",
    variant: "default" as const,
    gradient: "from-emerald-500/10 to-cyan-500/10",
    border: "hover:border-emerald-500/30",
  },
  {
    title: "Time Sheet Management",
    description:
      "A Java-based Android timesheet management application for tracking work hours and employee attendance efficiently.",
    tags: ["Java", "Android", "Management", "Productivity"],
    github: "https://github.com/RizwanATC/time_sheet_management",
    variant: "outline" as const,
    gradient: "from-orange-500/10 to-red-500/10",
    border: "hover:border-orange-500/30",
  },
  {
    title: "Portfolio & Resume",
    description:
      "A Flutter-based mobile portfolio and resume app showcasing personal projects, skills, and work history. A developer's portfolio built with Flutter.",
    tags: ["Flutter", "Dart", "Portfolio", "Mobile"],
    github: "https://github.com/RizwanATC/portfolio_resume2",
    variant: "secondary" as const,
    gradient: "from-violet-500/10 to-indigo-500/10",
    border: "hover:border-violet-500/30",
  },
];

export default function Projects() {
  return (
    <section id="projects" className="py-24 px-6 relative">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl" />
      </div>

      <div className="max-w-6xl mx-auto relative">
        <div className="text-center mb-16">
          <p className="text-indigo-400 text-sm font-semibold uppercase tracking-widest mb-3">
            Projects
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-white">
            Things I&apos;ve built
          </h2>
          <p className="text-white/40 mt-4 max-w-lg mx-auto">
            A selection of projects from my GitHub — ranging from mobile apps to
            web dashboards.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <Card
              key={project.title}
              className={`group relative overflow-hidden transition-all duration-300 hover:-translate-y-2 ${project.border}`}
            >
              {/* Gradient overlay */}
              <div
                className={`absolute inset-0 bg-gradient-to-br ${project.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
              />

              <CardHeader className="relative">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg">{project.title}</CardTitle>
                  <div className="flex gap-2">
                    <a
                      href={project.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-all"
                      aria-label="GitHub"
                    >
                      <GitHubLogoIcon className="w-4 h-4" />
                    </a>
                  </div>
                </div>
                <CardDescription className="text-sm leading-relaxed">
                  {project.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="relative flex flex-wrap gap-2">
                {project.tags.map((tag) => (
                  <Badge key={tag} variant={project.variant} className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <a
            href="https://github.com/RizwanATC"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-white/15 bg-white/5 text-white/60 hover:text-white hover:bg-white/10 text-sm transition-all duration-200"
          >
            <GitHubLogoIcon className="w-4 h-4" />
            View all on GitHub
            <ExternalLink size={14} />
          </a>
        </div>
      </div>
    </section>
  );
}
