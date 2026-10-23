# S-20: Aim down sights with the right mouse button

- **Priority:** P0 (milestone M3 Combat)
- **Covers:** FR-18 · **Decisions:** NFR-07
- **Depends on stories:** S-17

## User story
As a player, I want to hold the right mouse button to aim, so that I can shoot more precisely.

## Acceptance criteria
1. **Gun visible**
   - Given I am in first person
   - When I look at the screen
   - Then I see the rifle held in front of me
2. **Aim**
   - Given I hold the right mouse button
   - When aiming starts
   - Then the field of view narrows and the rifle moves to the center of the screen
3. **Release**
   - Given I am aiming
   - When I release the button
   - Then the view and rifle return to normal

## Out of scope
- Scoped sights (after MVP).

## Notes
- Aiming works only where shooting is allowed; it does not change the no-fire rules (S-17).
