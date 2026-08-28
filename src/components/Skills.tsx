import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Smartphone, Globe, Palette, Wrench } from "lucide-react";

const skillGroups = [
  {
    icon: <Smartphone size={20} className="text-indigo-400" />,
    title: "Mobile Development",
    skills: ["Flutter", "Dart", "Java (Android)", "Android Studio", "Material Design"],
    variant: "default" as const,
  },
  {
    icon: <Globe size={20} className="text-cyan-400" />,
    title: "Web & Full Stack",
    skills: ["Next.js", "TypeScript", "JavaScript", "React", "Tailwind CSS", "Vercel"],
    variant: "cyan" as const,
  },
  {
    icon: <Palette size={20} className="text-purple-400" />,
    title: "UI/UX Design",
    skills: ["Figma", "Prototyping", "Wireframing", "User Research", "Design Systems"],
    variant: "secondary" as const,
  },
  {
    icon: <Wrench size={20} className="text-emerald-400" />,
    title: "Tools & Others",
    skills: ["Git", "GitHub Actions", "Gradle", "Firebase", "REST APIs", "PostgreSQL"],
    variant: "outline" as const,
  },
];

export default function Skills() {
  return (
    <section id="skills" className="py-24 px-6 relative">
      {/* Background accent */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-32 bg-gradient-to-b from-transparent to-indigo-500/30" />
      </div>

      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-indigo-400 text-sm font-semibold uppercase tracking-widest mb-3">
            Skills
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-white">
            My tech stack
          </h2>
          <p className="text-white/40 mt-4 max-w-lg mx-auto">
            Technologies I use to bring ideas to life — from pixel-perfect UIs to
            production-ready mobile apps.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {skillGroups.map((group) => (
            <Card
              key={group.title}
              className="hover:border-white/20 transition-all duration-300 hover:-translate-y-1"
            >
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-white/5">{group.icon}</div>
                  <CardTitle className="text-base">{group.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                {group.skills.map((skill) => (
                  <Badge key={skill} variant={group.variant}>
                    {skill}
                  </Badge>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
