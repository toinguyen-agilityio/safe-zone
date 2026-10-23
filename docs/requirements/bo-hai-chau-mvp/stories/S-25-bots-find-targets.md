# S-25: Bots spot the nearest enemy and attack it

- **Priority:** P0 (milestone M4 Bots)
- **Covers:** FR-23 · **Decisions:** NFR-05
- **Depends on stories:** S-24, S-13

## User story
As a player, I want bots to look for the nearest enemy they can see and go after it, so that bots fight me and each other.

## Acceptance criteria
1. **Line of sight**
   - Given two positions with and without a house between them
   - When line of sight is checked
   - Then it is true only when nothing blocks (unit test)
2. **Nearest visible enemy**
   - Given several enemies in view
   - When a bot picks a target
   - Then it picks the nearest one it can see
3. **Bots fight bots**
   - Given only bots are near each other
   - When the match runs without my input
   - Then bots chase and engage each other
4. **Bots fight the player**
   - Given I am the nearest visible enemy
   - When a bot sees me
   - Then it goes after me

## Out of scope
- Aim, reaction and accuracy (S-26).

## Notes
- Enemies are the player and every other bot.
