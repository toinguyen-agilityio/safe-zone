# S-29: The flood zone has 5 phases that shrink around new centers

- **Priority:** P0 (milestone M5 Zone)
- **Covers:** FR-29, FR-30 · **Decisions:** BR-05, A-04 (timings tuned in balance)
- **Depends on stories:** S-04

## User story
As a player, I want a dry zone that shrinks in five phases with radii 230, 130, 68, 30 and 6, so that the match pushes everyone together.

## Acceptance criteria
1. **Five phases**
   - Given a match is running
   - When time passes (simulated time in a unit test)
   - Then the zone goes through 5 phases, each waiting and then shrinking
2. **Radii**
   - Given the phases
   - When each shrink completes
   - Then the radius is 230, 130, 68, 30 and 6 in order
3. **Center inside old zone**
   - Given a new zone is chosen
   - When its center is picked
   - Then it lies inside the previous zone (unit test)
4. **Avoid the river middle**
   - Given a new center
   - When it is picked
   - Then it is not in the middle of the river (unit test)

## Out of scope
- Damage (S-30); visuals (S-31, S-32).

## Notes
- Wait and shrink durations are set in `config.ts` and tuned in S-42.
