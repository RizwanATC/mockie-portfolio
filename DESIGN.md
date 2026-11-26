# Design

The site is a KayKit kingdom you scroll through, plus a plain résumé page. Everything drawn over the 3D world, and the plain page, is made of the same materials as the world: painted oak, parchment and ink, with one heraldic blue for actions.

## Tokens (`src/app/globals.css`)

| Token | Hex | Use |
| --- | --- | --- |
| `oak` / `oak-deep` | #6a4327 / #3d2616 | Toolbar planks, panel rims, rules |
| `vellum` / `vellum-deep` | #efdcb0 / #dcc18a | Panel and page surfaces |
| `ink` / `ink-soft` | #2b1c12 / #5a4330 | Text, secondary text |
| `heraldic` / `heraldic-deep` | #2c4f86 / #1d3762 | The only action colour: primary buttons, links, selected states |
| `gilt` | #d9a531 | Treasure only: coins, unlocked achievements, the current hero ring |

Utilities: `panel` (parchment with an oak rim), `plank` (oak toolbar and secondary buttons), `btn-heraldic` (primary action), `animate-unfurl` (a dialogue unrolling from its top edge).

## Type

Alegreya SC for lettering (names, headings, button labels) and Alegreya Sans for reading and controls. No other faces.

## Rules

- Icons come from `lucide-react` at stroke 2 (`STROKE` in `src/components/game/icons.tsx`); brand logos from `@radix-ui/react-icons`. No emoji.
- Achievement icons are keys (`QuestIcon` in `src/data/quests.ts`) mapped to icons in `icons.tsx`.
- The route map (`RouteMap.tsx`) is drawn from the same road curve the camera follows; keep it that way when anchors move.
- One authored motion: the dialogue unfurl. Reduced motion turns it off.
- The plain page (`src/components/plain/`) reads its copy from `src/data/ledger.ts` and app screenshots from `apps` in `src/data/resume.ts`.
