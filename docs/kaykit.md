# KayKit adventurers

Each level has an adventurer NPC from [KayKit Adventurers 2.0](https://kaylousberg.itch.io/kaykit-adventurers)
(CC0, by Kay Lousberg, www.kaylousberg.com). They idle on their stage, play a greeting when the camera settles on
their level, and jump when clicked. The Continue screen gathers the whole party.

- Component: `src/components/game/Adventurers.tsx` (the `party` table sets who stands where, holding what)
- Models: `public/models/kaykit/` (one GLB per character, plus shared `anims.glb` and `props.glb`, ~1.1 MB total)

## Rebuilding the models

Unzip the free pack into `images/` (git-ignored) and run:

```bash
node scripts/import-kaykit.mjs images/KayKit_Adventurers_2.0_FREE
```

To add a character, clip or prop, add its name to `CHARACTERS`, `CLIPS` or `PROPS` at the top of the script,
rerun it, then reference it in `party`. Props attach to the `handslot.r` / `handslot.l` bones.
