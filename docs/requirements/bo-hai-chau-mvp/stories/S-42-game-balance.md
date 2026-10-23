# S-42: Balance the match

- **Priority:** P0 (milestone M7 Release MVP)
- **Covers:** NFR-06, NFR-13 · **Decisions:** A-04
- **Depends on stories:** S-40

## User story
As a player, I want matches that feel fair and last the right time, so that a new player can sometimes win.

## Acceptance criteria
1. **Match length**
   - Given several full matches
   - When I time them
   - Then a typical match lasts 5 to 7 minutes
2. **New player can win**
   - Given testers who are new to the game
   - When they play several matches
   - Then they win about 1 in 5 matches
3. **Tuned numbers in config**
   - Given the tuning
   - When changes are made to damage, health, zone speed or bot accuracy
   - Then they are all made in `config.ts`
4. **Recorded**
   - Given the tuning is done
   - When I read the story
   - Then the final values and results are noted

## Out of scope
- Difficulty levels (out of scope, FR-28).

## Notes
- Works on the zone timings and damage numbers left open in the plan (A-04).
