# S-36: Kill feed, pickup messages and banners

- **Priority:** P0 (milestone M6 Loot & UI)
- **Covers:** FR-44 · **Decisions:** NFR-15
- **Depends on stories:** S-21, S-33

## User story
As a player, I want a kill feed, short pickup messages and event banners, so that I see what is happening around me.

## Acceptance criteria
1. **Kill feed**
   - Given someone is killed
   - When it happens
   - Then a line "killer — victim" appears in the kill feed
2. **Max 5 lines**
   - Given more than 5 kills in a short time
   - When a new line is added
   - Then only the latest 5 lines are shown
3. **Pickup toast**
   - Given I pick up an item
   - When it is added
   - Then a short Vietnamese message names the item
4. **Event banner**
   - Given a zone announcement (S-32)
   - When it triggers
   - Then it is shown as a banner at the top of the screen

## Out of scope
- Fire event banner (deferred, FR-38).

## Notes
- All three are part of the match screen.
