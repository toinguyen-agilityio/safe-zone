# S-32: Screen overlay and announcements for the flood

- **Priority:** P0 (milestone M5 Zone)
- **Covers:** FR-32, FR-33 · **Decisions:** NFR-15
- **Depends on stories:** S-30, S-31

## User story
As a player, I want a screen effect when I stand in the water and messages when the water rises or a new dry zone appears, so that I react in time.

## Acceptance criteria
1. **Overlay outside**
   - Given I stand outside the dry zone
   - When I am in the water
   - Then a water overlay covers the screen
2. **Overlay disappears**
   - Given the overlay is shown
   - When I return inside the dry zone
   - Then the overlay disappears
3. **Water rising message**
   - Given the water starts to rise
   - When the shrink phase begins
   - Then a Vietnamese message announces it
4. **New dry zone message**
   - Given a new dry zone is set
   - When it is announced
   - Then a Vietnamese message tells me a new dry zone appeared

## Out of scope
- Kill feed and other banners (S-36).

## Notes
- The messages are shown during the match as announcements.
