# S-26: Bots shoot with reaction time and imperfect aim

- **Priority:** P0 (milestone M4 Bots)
- **Covers:** FR-24 · **Decisions:** NFR-06
- **Depends on stories:** S-25, S-21

## User story
As a player, I want bots to react a moment after seeing me and miss more at long range or when I move, so that fights are fair.

## Acceptance criteria
1. **Reaction time**
   - Given a bot first sees an enemy
   - When it decides to shoot
   - Then it waits a reaction delay before the first shot
2. **Distance**
   - Given a target far away
   - When the bot shoots
   - Then its hit chance is lower than at close range
3. **Moving targets**
   - Given the target runs or jumps
   - When the bot shoots
   - Then its hit chance is lower than against a still target
4. **Bots strafe and shoot**
   - Given a bot is fighting
   - When I watch it
   - Then it moves sideways while firing

## Out of scope
- Difficulty levels (out of scope, FR-28).

## Notes
- All numbers are in `config.ts`; they are tuned in S-42.
