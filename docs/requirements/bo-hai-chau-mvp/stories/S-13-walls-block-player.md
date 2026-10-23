# S-13: Houses and map edge block the player

- **Priority:** P0 (milestone M2 Player)
- **Covers:** FR-01 · **Decisions:** NFR-05, NFR-12 (own collision code)
- **Depends on stories:** S-06, S-11

## User story
As a player, I want to be stopped by houses and by the map boundary, so that I cannot walk through walls or leave the map.

## Acceptance criteria
1. **Nearby objects lookup**
   - Given the map objects
   - When the game asks for objects near a position
   - Then it returns the nearby ones quickly (unit test)
2. **Wall blocks**
   - Given I walk into a house wall
   - When I keep pressing forward
   - Then I do not pass through it
3. **Slide and corners**
   - Given I walk at an angle into a wall or around a corner
   - When I keep moving
   - Then I slide along the wall and pass corners smoothly (unit tests: sliding, corner)
4. **Pushed out when inside**
   - Given I am placed inside a house shape
   - When the game updates
   - Then I am pushed out to free space (unit test)
5. **Map boundary**
   - Given I walk toward the map edge
   - When I reach the boundary
   - Then I cannot go further out

## Out of scope
- Bullets blocked by houses (S-18); bots getting unstuck (S-28).

## Notes
- Players are round shapes against box-shaped houses.
