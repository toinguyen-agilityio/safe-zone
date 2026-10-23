# S-07: Houses appear in the city and render efficiently

- **Priority:** P0 (milestone M1 Map)
- **Covers:** FR-04, NFR-01 · **Decisions:** NFR-12 (instanced rendering)
- **Depends on stories:** S-06

## User story
As a player, I want to see all the generated houses with lit windows, so that the city looks alive without slowing the game.

## Acceptance criteria
1. **Houses visible**
   - Given the map from S-05 and houses from S-06
   - When I view the city on the dev page
   - Then all houses are drawn on their blocks
2. **Windows**
   - Given houses are drawn
   - When I look at a wall
   - Then windows appear on it in a pattern that stays fixed in the world, not stretching with house size
3. **One draw call**
   - Given the full city is drawn
   - When rendering is inspected
   - Then all houses together use a single draw call
4. **Frame rate not hurt**
   - Given the city with houses
   - When I view it in Chrome
   - Then the frame rate does not drop below the level measured before this story

## Out of scope
- Final 60 FPS tuning (S-41).

## Notes
- Instanced rendering for houses and trees is part of the mandatory stack (NFR-12).
