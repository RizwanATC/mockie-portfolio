import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });
const display = Space_Grotesk({ subsets: ["latin"], variable: "--font-display" });

export const metadata: Metadata = {
  title: "Rizwan (Mockie) — Mobile Developer & UI/UX Designer",
  description:
    "Portfolio of Rizwan, a Mobile Developer and UI/UX Designer based in Seri Kembangan, Malaysia. Specializes in Flutter, Java Android, and TypeScript.",
  keywords: ["Mobile Developer", "Flutter", "Dart", "Java Android", "UI/UX", "Malaysia"],
  openGraph: {
    title: "Rizwan (Mockie) — Mobile Developer & UI/UX Designer",
    description:
      "Portfolio of Rizwan, a Mobile Developer and UI/UX Designer based in Seri Kembangan, Malaysia.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} ${display.variable} min-h-full bg-[#08080f] text-white antialiased`}>
        {children}
      </body>
    </html>
  );
}
