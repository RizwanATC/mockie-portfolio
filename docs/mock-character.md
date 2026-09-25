# Character pipeline

The 3D character is `public/models/mock.glb`, built from a Meshy (or Mixamo) export by
`scripts/import-character.mjs`. `src/components/game/Character.tsx` plays its animations by name.
Switch back to the procedural ghost with `character = "ghost"` in `src/data/resume.ts`.

## 1. Prepare the source image

Meshy and auto-riggers work best from a **full-body, front-facing** image:

- whole body visible, head to shoes (no crop at the knees)
- arms relaxed and slightly away from the body (A-pose), not raised
- plain or removed background
- one person, nothing held in the hands

If the photo doesn't meet that, generate a cleaned-up version first (any image generator) with a prompt like:

> Full-body 3D cartoon character of this man, stylized Pixar-like, standing straight facing the camera in an
> A-pose with arms slightly away from the body, black cap, beard, light blue t-shirt, black backpack,
> black shorts, sneakers, plain white background, even studio lighting, full body head to toe.

## 2. Meshy: image to 3D

1. **Image to 3D** → upload the image.
2. Settings: **Topology: Quad** (or Triangle), **Target polycount: ~20k–30k**, **Texture: on**, PBR on.
3. Pick the best of the results. Check the back and the hands.

## 3. Meshy: rig and animate

1. On the model: **Animate → Rig**. Choose **Humanoid**, then place the markers (chin, wrists, elbows, knees, groin) if asked.
2. In **Animations**, add at least:
   - **Walking** (plays while scrolling between levels)
   - **Idle** (plays when standing on a level)
   - Optional: waving, dancing, typing, jumping, pointing, bowing (each plays on its level; see the table below)
3. **Download → GLB**. If Meshy only lets you export one animation per file, export each one separately.

## 4. Import

Put the files in `images/` and run one of:

```bash
# one file that already contains all animations
node scripts/import-character.mjs images/me.glb

# character + separate animation files (the file name becomes the clip name)
node scripts/import-character.mjs images/me.glb images/Walking.glb images/Idle.glb images/Waving.glb
```

Mixamo `.fbx` files work the same way (character "with skin" first, animations "without skin" after).
The script merges everything onto the first file's skeleton, shrinks textures to 1024px WebP, compresses the
mesh, and writes `public/models/mock.glb` (usually under 1 MB). Then refresh the page.

## Clip names

Matched case-insensitively, so Meshy/Mixamo names work as-is:

| Plays when | Clip name contains |
| --- | --- |
| scrolling between levels, and the Parking Lot level | `walk` |
| standing on a level without its own clip | `idle` or `breath` |
| once on load and when clicked | `stand up`, `intro`, `greet` (or Mixamo's `mixamo.com`) |
| Stream Room | `danc` |
| Cashier Counter | `typ` |
| Night Drive | `driv` |
| Architecture Tower | `jump` |
| Arcade | `point` |
| Title / Continue | `wav` / `bow` |
