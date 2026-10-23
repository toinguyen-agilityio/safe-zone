# S-30: Standing in the flood drains health

- **Priority:** P0 (milestone M5 Zone)
- **Covers:** FR-31 · **Decisions:** NFR-05, NFR-06
- **Depends on stories:** S-29, S-21

## User story
As a player, I want to lose health while I stand outside the dry zone, more each phase, so that I must keep moving in.

## Acceptance criteria
1. **Inside is safe**
   - Given I am inside the dry zone
   - When time passes
   - Then I lose no health from the zone
2. **Outside drains**
   - Given I am outside the dry zone
   - When time passes
   - Then I lose health every second
3. **Rises by phase**
   - Given later phases
   - When I stand outside
   - Then the drain per second grows from 1 in the first phase to 12 in the last (unit test with simulated time)
4. **Applies to bots**
   - Given a bot is outside the zone
   - When time passes
   - Then it loses health the same way

## Out of scope
- Visual water (S-31) and overlay (S-32).

## Notes
- Intermediate damage values are set during development in `config.ts`.
