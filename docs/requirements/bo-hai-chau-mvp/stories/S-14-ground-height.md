# S-14: Walk up and down bridge ramps, and sink to the river bed

- **Priority:** P0 (milestone M2 Player)
- **Covers:** FR-03 · **Decisions:** Q-02 (rooftops deferred)
- **Depends on stories:** S-08, S-11

## User story
As a player, I want the ground under me to follow the terrain, bridge decks and river bed, so that I walk over bridges and wade into the river naturally.

## Acceptance criteria
1. **Ground height lookup**
   - Given any position on the map
   - When the game asks for the ground height
   - Then it returns the road level, river bed level or bridge deck level correctly (unit test)
2. **Under a bridge is river bed**
   - Given a position under a bridge deck
   - When the height is asked
   - Then it is the river bed, not the deck (unit test)
3. **Smooth ramps**
   - Given I walk up a bridge ramp
   - When I move along it
   - Then my view rises and falls smoothly without jumps
4. **River is lower**
   - Given I walk from the bank toward the water
   - When I enter the river area
   - Then the ground drops to the river bed

## Out of scope
- Standing on rooftops (deferred P1, FR-06).

## Notes
- Swimming behavior is in S-15.
