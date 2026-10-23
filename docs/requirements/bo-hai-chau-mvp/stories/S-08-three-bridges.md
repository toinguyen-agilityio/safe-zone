# S-08: Three bridges cross the river

- **Priority:** P0 (milestone M1 Map)
- **Covers:** FR-03 · **Decisions:** Q-03
- **Depends on stories:** S-05

## User story
As a player, I want to see three bridges over the Hàn river with ramps, railings and pillars, so that I can recognize the Hàn River Bridge, Dragon Bridge and Trần Thị Lý Bridge positions.

## Acceptance criteria
1. **Three bridges present**
   - Given the map
   - When I look at the river
   - Then three bridges cross it at the positions given in the layout
2. **Deck and ramps**
   - Given a bridge
   - When I look at it from the side
   - Then it has a raised deck with ramps up and down at both ends
3. **Railings and pillars**
   - Given a bridge
   - When I look at it
   - Then it has railings along the deck and pillars standing in the water
4. **Open underneath**
   - Given a bridge
   - When I look under the deck
   - Then the river is visible below with open space for swimming

## Out of scope
- Walking across and swimming under (S-14, S-15); Dragon Bridge shape (S-09).

## Notes
- Crossing from one bank to the other without getting stuck is checked in S-15.
