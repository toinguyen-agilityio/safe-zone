# S-39: Notice on touch devices that they are not supported

- **Priority:** P0 (milestone M6 Loot & UI)
- **Covers:** FR-46 · **Decisions:** NFR-15, NFR-07
- **Depends on stories:** S-38

## User story
As a player on a phone or tablet, I want to be told this game needs a keyboard and mouse, so that I understand why it does not work.

## Acceptance criteria
1. **Notice on touch**
   - Given I open the game page on a touch device
   - When the page loads
   - Then a Vietnamese notice says touch devices are not supported
2. **No start**
   - Given the notice is shown
   - When I try to enter a match
   - Then the match does not start
3. **Desktop unaffected**
   - Given I open the page on a desktop with mouse and keyboard
   - When it loads
   - Then no notice is shown

## Out of scope
- Touch controls (after MVP).

## Notes
- The notice is shown when the page opens, in place of the start screen's enter button.
