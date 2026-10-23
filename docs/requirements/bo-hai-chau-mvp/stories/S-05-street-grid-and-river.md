# S-05: See the street grid and the Hàn river

- **Priority:** P0 (milestone M1 Map)
- **Covers:** FR-01, FR-02 · **Decisions:** Q-03 (built from the plan only)
- **Depends on stories:** S-04

## User story
As a player, I want to see a ground with a street grid modelled on Hải Châu and the Hàn river on the east side, so that the place looks like Da Nang.

## Acceptance criteria
1. **Map layout data**
   - Given the map is about 640x640 units
   - When the layout is read
   - Then it lists streets, the river, bridges and landmark areas, and a unit test shows no street overlaps the river
2. **Streets visible**
   - Given the game page opened by `npm run dev`
   - When I look at the map from above
   - Then I clearly see the street grid with lane markings and grass areas
3. **River on the east**
   - Given the same view
   - When I look at the east side
   - Then a gently curving river is cut into the ground with a water surface
4. **No gaps at the edge**
   - Given the view near the map edge
   - When I look toward the outside
   - Then the river continues beyond the map and no empty gap is visible

## Out of scope
- Houses (S-06, S-07), bridges (S-08), walking on the map (S-11).

## Notes
- The layout should look like Hải Châu: a grid of streets, river along the east.
- Until the start screen (S-38) exists, the scene is shown directly on the dev page.
