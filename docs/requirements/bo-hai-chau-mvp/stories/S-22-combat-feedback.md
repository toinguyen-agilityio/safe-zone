# S-22: Visual feedback for shooting and being shot

- **Priority:** P0 (milestone M3 Combat)
- **Covers:** FR-21 · **Decisions:** NFR-04 (cartoon violence, no gore)
- **Depends on stories:** S-18

## User story
As a player, I want to see tracers, muzzle flash, hit markers and the direction of incoming fire, so that I understand the fight.

## Acceptance criteria
1. **Tracer and flash**
   - Given I fire
   - When a shot leaves the rifle
   - Then a tracer line and a muzzle flash are shown
2. **Hitmarker**
   - Given my shot hits a target
   - When the hit happens
   - Then a hitmarker appears on the crosshair
3. **Head hit color**
   - Given I hit a head
   - When the hitmarker appears
   - Then it is yellow
4. **Incoming direction**
   - Given someone shoots me
   - When I take damage
   - Then an indicator shows the direction the shot came from

## Out of scope
- Sound (S-23).

## Notes
- No blood or gore.
