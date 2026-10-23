# S-17: Fire the AK-Mía rifle

- **Priority:** P0 (milestone M3 Combat)
- **Covers:** FR-15, FR-20 · **Decisions:** NFR-06
- **Depends on stories:** S-15

## User story
As a player, I want an automatic rifle with a magazine and reload, so that I can shoot while keeping to the rules of when shooting is allowed.

## Acceptance criteria
1. **Automatic fire**
   - Given I hold the left mouse button with ammo
   - When the rifle fires
   - Then it shoots repeatedly until I release or run out of the magazine
2. **Magazine of 30**
   - Given a full magazine
   - When I fire 30 shots
   - Then the magazine is empty and I cannot fire
3. **Reload**
   - Given the magazine is empty or I press the reload key
   - When I reload with ammo in reserve
   - Then it takes 1.8 s and then refills the magazine from reserve
4. **Cannot fire in some states**
   - Given I am swimming, parachuting or sprinting
   - When I press the fire button
   - Then no shot is fired

## Out of scope
- Hit detection (S-18), recoil (S-19), aiming (S-20), damage (S-21), ammo pickups (S-33).

## Notes
- Hitscan weapon: a shot hits instantly.
