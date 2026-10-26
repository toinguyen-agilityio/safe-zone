# Performance

Target: about 60 FPS in a full match on an integrated-GPU laptop in Chrome at 1080p.

## How to measure

1. `npm run build && npx vite preview`, then open `http://localhost:4173/?fps&autostart` in Chrome.
2. Play a full match, from the drop to the end. The label at the top left shows the frame rate of the
   last second and the 1% low of the whole run (the frame rate of the slowest hundredth of frames).
3. The label counts the real time of each frame, so a slow machine is not hidden by the game's own
   limit on its time step.
4. Fill in the table below and run `npm run size` for the bundle.

## Results on real hardware

**Not recorded yet.** The numbers need a real machine and this was prepared in a cloud container
with no GPU. Whoever runs the match on the laptop fills in this table:

| Machine | Browser | Resolution | Average FPS | 1% low FPS |
| ------- | ------- | ---------- | ----------- | ---------- |
| _to fill_ | _to fill_ | 1920x1080 | _to fill_ | _to fill_ |

If the average is below about 60, add the main hotspots from Chrome's Performance panel under
"Hotspots to check" below.

## Bundle size

`npm run size`: JavaScript is **169 KB gzip** (limit 1024 KB).

## What was measured in the cloud container (not real hardware)

Headless Chrome 153 with the software renderer (ANGLE with SwiftShader, on a 4 core Intel Xeon
2.1 GHz), production build, a full match started with `?fps&autostart`, 40 seconds each:

| Resolution | Average FPS | 1% low FPS |
| ---------- | ----------- | ---------- |
| 1280x720   | 6           | 2          |
| 1920x1080  | 3           | 1          |

These say nothing about a laptop GPU. They do show that the cost follows the number of pixels, not the
amount of geometry.

What one frame draws at 1280x720 (about six seconds into the match):

- 103 draw calls and 37,462 triangles; 107 geometries, 3 textures, 12 shader programs.
- 431 meshes, 176 lines, 19 sprites in the scene.

That is a light scene for any GPU, so the likely hotspots are fill-rate ones. They are guesses to check
on the real machine, in this order:

1. The flood water: one transparent plane over the whole map plus a double-sided transparent
   cylinder, drawn over the city every frame (`src/render/flood-water.ts`, `src/render/water-wall.ts`).
2. The window pattern shader on every house (`src/render/house-material.ts`).
3. The pixel ratio, already capped at 1.5 (`src/config/world.ts`).
4. The HUD, which redraws the minimap canvas every frame (`src/ui/widgets/minimap.ts`).

If the real numbers are low, try them one at a time: hide the water plane, hide the wall, then turn
the minimap down to a redraw every few frames.

## Changes made after the first measurement

- The flood water plane and the water wall are left out of the frame while the dry zone still covers the
  whole map (the first minute of the match), since there is nothing to see (`floodVisible`).
- The minimap is redrawn 20 times a second at most instead of on every frame.

Both leave the picture as it was. In the cloud container they changed nothing that can be seen in the
numbers: the software renderer was 6 FPS before and after, and also with the water hidden and with the HUD
hidden, and the JavaScript side of a frame (all game updates and the render call) took about 2 ms. So the
time is spent in the renderer, on the pixels and triangles, not in the game code. Turning the antialiasing
off in the same test took it from 6 to 9 FPS, but that changes how the game looks, so it was left on; it
is the first thing to try if a real laptop is short of frames.

The remaining gap to 60 FPS on a real machine is **not known**: the table above still has to be filled
in on one. Re-measure there with the steps in "How to measure" before changing anything else.
