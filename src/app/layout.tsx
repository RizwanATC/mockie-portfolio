import type { Metadata } from "next";
import { Alegreya_SC, Alegreya_Sans } from "next/font/google";
import "./globals.css";

// One family in two voices: Alegreya SC for the kingdom's lettering, Alegreya Sans for reading and controls.
const display = Alegreya_SC({ subsets: ["latin"], weight: ["500", "700", "800"], variable: "--font-alegreya-sc" });
const sans = Alegreya_Sans({ subsets: ["latin"], weight: ["400", "500", "700"], style: ["normal", "italic"], variable: "--font-alegreya-sans" });

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
    <html lang="en" className={`h-full ${sans.variable} ${display.variable}`}>
      <body className="min-h-full font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
