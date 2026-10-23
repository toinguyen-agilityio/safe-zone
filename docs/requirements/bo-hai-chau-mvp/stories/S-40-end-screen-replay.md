# S-40: End screen with results and replay

- **Priority:** P0 (milestone M6 Loot & UI)
- **Covers:** FR-45 · **Decisions:** NFR-15, NFR-04, BR-01
- **Depends on stories:** S-35, S-38, S-21

## User story
As a player, I want to see my result when I win or die and start again, so that I can keep playing.

## Acceptance criteria
1. **Shown at the end**
   - Given I die or am the last one alive
   - When the match ends
   - Then the end screen appears automatically
2. **Results**
   - Given the end screen
   - When I read it
   - Then it shows my rank, kills, damage dealt and survival time
3. **Line by cause of death**
   - Given the end screen
   - When it shows
   - Then a Vietnamese line matches how I died (shot, flood, or winning with the mì Quảng line)
4. **Replay**
   - Given the end screen
   - When I click the replay button
   - Then a new match starts with a parachute drop
5. **Replay is clean**
   - Given I replay 3 times in a row
   - When I check the game
   - Then there are no errors and memory use does not keep growing

## Out of scope
- Leaderboards and accounts (out of scope).

## Notes
- Winning player "eats mì Quảng" per the game concept; the line is Vietnamese and cartoon-style.
