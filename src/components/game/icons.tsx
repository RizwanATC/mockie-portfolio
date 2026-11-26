import { Coins, Crown, Drama, Footprints, Gem, Handshake, Map, MessageCircle, MessageCircleQuestionMark, type LucideIcon } from "lucide-react";
import type { QuestIcon } from "@/data/quests";

// Achievement and toast icons. One library, one stroke weight.
export const QUEST_ICONS: Record<QuestIcon, LucideIcon> = {
  steps: Footprints,
  coin: Coins,
  talk: MessageCircle,
  ask: MessageCircleQuestionMark,
  map: Map,
  treasure: Gem,
  party: Handshake,
  masks: Drama,
  crown: Crown,
};

export const STROKE = 2;

// The gold coin from the world, flat: used wherever coins are counted.
export function CoinMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" aria-hidden className={className}>
      <circle cx="10" cy="10" r="8.5" fill="#d9a531" stroke="#7a5414" strokeWidth="1.5" />
      <circle cx="10" cy="10" r="5.2" fill="none" stroke="#7a5414" strokeWidth="1.2" opacity="0.7" />
      <path d="M10 6.6 12.6 8.5 11.6 11.6H8.4L7.4 8.5Z" fill="#f6d77a" stroke="#7a5414" strokeWidth="0.9" strokeLinejoin="round" />
    </svg>
  );
}
