import Image from "next/image";
import { GitHubLogoIcon, TwitterLogoIcon, LinkedInLogoIcon } from "@radix-ui/react-icons";
import { MapPin, Code2, Layers } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const stats = [
  { label: "Years Experience", value: "5+" },
  { label: "Live Apps",        value: "2"   },
  { label: "Downloads",        value: "1M+" },
  { label: "Technologies",     value: "10+" },
];

export default function About() {
  return (
    <section id="about" className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-indigo-400 text-sm font-semibold uppercase tracking-widest mb-3">
            About Me
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-white">
            Passionate about mobile experiences
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left — photo + text */}
          <div className="space-y-6">

            {/* Avatar */}
            <div className="flex items-center gap-5">
              <div className="relative flex-shrink-0">
                {/* Glow ring */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 blur-md opacity-40 scale-110" />
                <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-white/20 shadow-xl">
                  <Image
                    src="/profile/avatar.jpg"
                    alt="Rizwan Bin Mat Nawi"
                    fill
                    className="object-cover"
                    sizes="96px"
                  />
                </div>
                {/* Online dot */}
                <div className="absolute bottom-0.5 right-0.5 w-4 h-4 rounded-full bg-green-400 border-2 border-[#08080f]" />
              </div>
              <div>
                <h3 className="text-white font-bold text-lg leading-tight">Rizwan Bin Mat Nawi</h3>
                <p className="text-white/50 text-sm">Native Android Developer</p>
                <div className="flex items-center gap-1.5 mt-1 text-white/40 text-xs">
                  <MapPin size={11} className="text-indigo-400" />
                  Selangor, Malaysia
                </div>
              </div>
            </div>

            <p className="text-white/60 text-lg leading-relaxed">
              Native Android Developer with{" "}
              <span className="text-white font-medium">5+ years of experience</span>{" "}
              building production apps used by over a million people. Specialised in
              Kotlin, MVVM architecture, and modern Android development.
            </p>
            <p className="text-white/60 leading-relaxed">
              Currently at <span className="text-white font-medium">Riverlens Sdn. Bhd.</span> working
              on the Alafasy app. Previously built TheNoor at Noor Luminous — an Islamic
              lifestyle app with 1M+ installs. I bridge clean architecture with
              intuitive UI/UX design.
            </p>

            <div className="flex flex-wrap gap-3 pt-2">
              <div className="flex items-center gap-2 text-white/50 text-sm">
                <Code2 size={15} className="text-purple-400" />
                Kotlin · Flutter · Java
              </div>
              <div className="flex items-center gap-2 text-white/50 text-sm">
                <Layers size={15} className="text-cyan-400" />
                MVVM · Jetpack · Hilt
              </div>
            </div>

            <div className="flex gap-3 pt-2 flex-wrap">
              <a href="https://github.com/RizwanATC" target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10 text-sm transition-all">
                <GitHubLogoIcon className="w-4 h-4" />
                GitHub
              </a>
              <a href="https://x.com/rizwanmatnawi" target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10 text-sm transition-all">
                <TwitterLogoIcon className="w-4 h-4" />
                @rizwanmatnawi
              </a>
              <a href="https://linkedin.com/in/rizwanmatnawi/" target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10 text-sm transition-all">
                <LinkedInLogoIcon className="w-4 h-4" />
                LinkedIn
              </a>
            </div>
          </div>

          {/* Right — stats */}
          <div className="grid grid-cols-2 gap-4">
            {stats.map((stat) => (
              <Card key={stat.label} className="text-center p-6">
                <CardContent className="p-0">
                  <div className="text-4xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent mb-2">
                    {stat.value}
                  </div>
                  <div className="text-white/50 text-sm">{stat.label}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
