# S-23: Synthesized sound for shots, hits and pickups

- **Priority:** P0 (milestone M3 Combat)
- **Covers:** NFR-09 · **Decisions:** NFR-12 (Web Audio, no audio files), NFR-03
- **Depends on stories:** S-17

## User story
As a player, I want gun, hit and pickup sounds, so that the game feels responsive.

## Acceptance criteria
1. **Gun sound**
   - Given sound is enabled
   - When I fire
   - Then a shot sound plays
2. **Hit sound**
   - Given my shot hits a target
   - When the hit happens
   - Then a hit sound plays
3. **Pickup sound**
   - Given an item pickup exists (S-33)
   - When I pick up an item
   - Then a pickup sound plays
4. **Starts after a click**
   - Given the page has just loaded
   - When I have not clicked anything yet
   - Then no sound is played; sound starts after my first click
5. **No audio files**
   - Given the project
   - When I look at the assets
   - Then all sounds are generated in the browser, no audio files

## Out of scope
- Music and recorded audio (after MVP).

## Notes
- The pickup sound is wired once S-33 exists.
