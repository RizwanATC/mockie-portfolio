import { GitHubLogoIcon, TwitterLogoIcon } from "@radix-ui/react-icons";
import { Heart } from "lucide-react";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-white/10 py-10 px-6">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="text-white/40 text-sm flex items-center gap-1.5">
          <span>
            &copy; {year} Rizwan (Mockie). Built with
          </span>
          <Heart size={13} className="text-red-400 fill-red-400" />
          <span>using Next.js & Tailwind</span>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="https://github.com/RizwanATC"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-lg text-white/40 hover:text-white hover:bg-white/5 transition-all"
            aria-label="GitHub"
          >
            <GitHubLogoIcon className="w-[18px] h-[18px]" />
          </a>
          <a
            href="https://x.com/rizwanmatnawi"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-lg text-white/40 hover:text-white hover:bg-white/5 transition-all"
            aria-label="Twitter"
          >
            <TwitterLogoIcon className="w-[18px] h-[18px]" />
          </a>
        </div>
      </div>
    </footer>
  );
}
