# S-41: Measure and improve performance

- **Priority:** P0 (milestone M7 Release MVP)
- **Covers:** NFR-01, NFR-02 · **Decisions:** Q-10 (4G target dropped, 1 MB kept), Q-06
- **Depends on stories:** S-40

## User story
As a player on a mid-range laptop, I want the game to run smoothly, so that fights are playable.

## Acceptance criteria
1. **60 FPS**
   - Given a laptop with integrated GPU and Chrome at 1080p
   - When I play a full match
   - Then the frame rate holds about 60 FPS
2. **Pixel ratio cap**
   - Given a high-density display
   - When the game renders
   - Then the pixel ratio is at most 1.5
3. **Bundle size**
   - Given the production build
   - When I check the JavaScript size
   - Then it is under 1 MB gzip
4. **Results written down**
   - Given the measurements
   - When the story is done
   - Then the numbers and the machine used are recorded in the story or README

## Out of scope
- 3 s / 4G load target (dropped, Q-10).

## Notes
- Measurement uses the built game run locally.
