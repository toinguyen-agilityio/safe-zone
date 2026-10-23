# S-37: Minimap that turns with my view

- **Priority:** P0 (milestone M6 Loot & UI)
- **Covers:** FR-42 · **Decisions:** Q-02 (big map deferred)
- **Depends on stories:** S-05, S-29

## User story
As a player, I want a minimap showing where I am and where the zone is, so that I can plan my route.

## Acceptance criteria
1. **Map and position**
   - Given a match is running
   - When I look at the minimap
   - Then it shows the streets and river with my position
2. **Rotates with view**
   - Given I turn
   - When my facing changes
   - Then the minimap rotates so that up is where I look
3. **Zones**
   - Given the zone has a current and a next circle
   - When I look at the minimap
   - Then both circles are drawn

## Out of scope
- Big map with key M (deferred P1, FR-43).

## Notes
- The minimap is part of the match screen.
