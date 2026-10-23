# S-11: Look around and walk in first person

- **Priority:** P0 (milestone M2 Player)
- **Covers:** FR-09 · **Decisions:** NFR-07 (Chrome only)
- **Depends on stories:** S-05

## User story
As a player, I want to look with the mouse and walk with WASD from a first-person view, so that I can explore the city.

## Acceptance criteria
1. **Mouse look**
   - Given I click the game page in Chrome
   - When the mouse is captured (pointer lock) and I move the mouse
   - Then the view turns accordingly in first person
2. **WASD walking**
   - Given I am on the ground
   - When I press W, A, S or D
   - Then I walk forward, left, back or right relative to where I look
3. **Release the mouse**
   - Given the mouse is captured
   - When pointer lock is lost
   - Then keys and mouse stop moving me until I click again

## Out of scope
- Pause overlay (S-12), sprint/jump/swim (S-15), walls (S-13).
- Right-mouse look fallback is deferred (P1, FR-13).

## Notes
- Reached from the game page opened by `npm run dev`; the start screen (S-38) later becomes the way in.
