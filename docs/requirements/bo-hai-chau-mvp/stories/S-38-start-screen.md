# S-38: Start screen with controls and a button to enter the match

- **Priority:** P0 (milestone M6 Loot & UI)
- **Covers:** FR-40 · **Decisions:** NFR-15 (Vietnamese), NFR-07 (Chrome), NFR-03
- **Depends on stories:** S-05, S-16

## User story
As a player, I want a start screen that explains the game and its controls, so that I can begin when ready.

## Acceptance criteria
1. **Opens first**
   - Given I open the game page in Chrome
   - When it finishes loading
   - Then the start screen is the first thing shown (home page)
2. **Content**
   - Given the start screen
   - When I read it
   - Then it shows the game name, a short Vietnamese description and the control keys
3. **Flying background**
   - Given the start screen is open
   - When I wait
   - Then the background camera flies around the Hàn river
4. **Enter**
   - Given the start screen
   - When I click the enter-match button
   - Then the start screen closes and the match begins with the parachute drop

## Out of scope
- Touch notice (S-39); end screen (S-40).

## Notes
- The game name must not use PUBG's name or style (NFR-03).
