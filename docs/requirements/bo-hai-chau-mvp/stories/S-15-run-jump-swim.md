# S-15: Sprint, jump and swim

- **Priority:** P0 (milestone M2 Player)
- **Covers:** FR-02, FR-10, FR-03 · **Decisions:** NFR-06
- **Depends on stories:** S-13, S-14

## User story
As a player, I want to sprint, jump and swim, so that I can move around the city and cross the river.

## Acceptance criteria
1. **Sprint**
   - Given I am walking
   - When I hold Shift
   - Then I move faster than walking
2. **Jump with gravity**
   - Given I stand on the ground
   - When I press Space
   - Then I jump up and fall back down
3. **Swim**
   - Given I enter the river
   - When I move
   - Then I swim slowly and cannot sprint
4. **Cross a bridge**
   - Given I stand on one bank
   - When I walk over any of the three bridges
   - Then I reach the other bank without getting stuck
5. **Swim under a bridge**
   - Given I am in the river
   - When I swim under a bridge
   - Then I pass beneath it freely

## Out of scope
- Shooting limits while swimming or sprinting (S-17).

## Notes
- Speeds are set in `config.ts` (NFR-06).
