# S-31: Flood water covers the streets outside the zone

- **Priority:** P0 (milestone M5 Zone)
- **Covers:** FR-32 · **Decisions:** NFR-12
- **Depends on stories:** S-29

## User story
As a player, I want to see flood water on the streets outside the dry zone with a water wall at its edge, so that I can tell where it is safe.

## Acceptance criteria
1. **Water outside**
   - Given the zone has shrunk
   - When I look at streets outside the dry zone
   - Then they are covered with a water surface
2. **Water wall**
   - Given the zone edge
   - When I look at it
   - Then a cylindrical wall of water marks the boundary
3. **Foam at the edge**
   - Given the boundary
   - When I look at where water meets dry ground
   - Then white foam is visible
4. **Follows the shrink**
   - Given the zone is shrinking
   - When time passes
   - Then the water and wall move inward smoothly

## Out of scope
- Screen overlay and messages (S-32).

## Notes
- The water appears during the match; no extra screen is needed.
