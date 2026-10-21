# KayKit world

The 3D portfolio is built from three free [KayKit](https://kaylousberg.itch.io) packs by Kay Lousberg
(CC0, www.kaylousberg.com): **Adventurers 2.0**, **Forest Nature Pack 1.0** and **Medieval Hexagon Pack 1.0**.

| What | Where |
| --- | --- |
| Hero select (Archer by default, plus Knight, Mage, Barbarian, Rogue and the original Mockie model) | `heroes` in `src/data/resume.ts`, `HeroPicker.tsx` |
| The winding road: one anchor per level, camera and hero follow the curve | `src/components/game/path.tsx` (`ANCHORS`) |
| NPCs, their lines, the questions visitors can ask them (built from each level's résumé entry), coins and achievements | `src/data/quests.ts` (`party`, `topicsFor`, `achievements`) |
| NPC rendering and greetings | `src/components/game/Adventurers.tsx` |
| Hex terrain, road ribbon, village, forest, river, mountains, clouds and stage props | `src/components/game/Village.tsx` |
| Coins | `src/components/game/Coins.tsx` |
| Coin counter, quest log, hero menu, dialogue box with question choices, and toasts | `src/components/game/Hud.tsx` |
| Save game (hero, coins, NPCs met, questions asked, levels visited, achievements) | `src/lib/store.ts`, saved to `localStorage` as `mockie-save` |

## Rebuilding the models

Unzip the three packs into `images/` (git-ignored) and run:

```bash
node scripts/import-kaykit.mjs images
```

It writes `public/models/kaykit/` (NPCs, shared NPC animations, hand props, one GLB per hero, and `world.glb`
with every terrain, building and nature piece under its own named node) and the hero portraits in
`public/kaykit/portraits/`. To use another piece, add it to the lists at the top of the script, rerun it, then
reference it by name (`Scatter` in `Village.tsx` draws any `world.glb` piece as instances).

## Moving a stage

Stages sit on `ANCHORS` in `path.tsx`, and everything on a stage (NPCs, coins, props) uses stage-local axes: +x runs
along the road, +z points at the camera. Move an anchor and its stage, NPC and coins move with it; `Village.tsx`
keeps the camera's view clear by checking `inView` and the distance to the road before placing scenery.
