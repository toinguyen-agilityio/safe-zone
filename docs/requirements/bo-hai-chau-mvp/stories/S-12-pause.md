# S-12: Pause and resume with Esc

- **Priority:** P0 (milestone M2 Player)
- **Covers:** FR-14 · **Decisions:** NFR-15 (Vietnamese text)
- **Depends on stories:** S-11

## User story
As a player, I want Esc to pause the match and a click to resume, so that I can take a break.

## Acceptance criteria
1. **Esc pauses**
   - Given a match is running
   - When I press Esc
   - Then the match freezes and a pause screen in Vietnamese appears
2. **Click resumes**
   - Given the pause screen
   - When I click it
   - Then the pause screen disappears and the match continues where it stopped
3. **Time stops**
   - Given the match is paused
   - When I wait several seconds
   - Then timers, bots and the zone do not advance

## Out of scope
- P key pause fallback (deferred P1, FR-13).

## Notes
- The pause screen is reached by pressing Esc during a match.
