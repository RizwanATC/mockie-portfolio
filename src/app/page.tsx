import GameShell from "@/components/game/GameShell";
import PlainSite from "@/components/plain/PlainSite";

export default function Home() {
  return <GameShell plain={<PlainSite />} />;
}
