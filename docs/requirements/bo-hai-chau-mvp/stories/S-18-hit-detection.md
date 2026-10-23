# S-18: Shots hit targets and are blocked by houses

- **Priority:** P0 (milestone M3 Combat)
- **Covers:** FR-16, FR-19 · **Decisions:** NFR-05
- **Depends on stories:** S-13, S-17

## User story
As a player, I want my shots to hit the head, body or legs of a target and to stop at houses, so that cover matters.

## Acceptance criteria
1. **Hit regions**
   - Given a target with head, torso and legs hitboxes
   - When a shot is aimed at each region
   - Then the game reports which region was hit (unit test)
2. **Headshot double damage**
   - Given a head hit
   - When damage is calculated
   - Then it is twice the body damage
3. **Houses block**
   - Given a house between me and a target
   - When I shoot toward the target
   - Then the shot stops at the house and does not hit the target (unit test)
4. **Nearest wins**
   - Given a shot passes several things
   - When the game decides the result
   - Then the nearest thing along the line is hit

## Out of scope
- Armor and death (S-21); visual effects (S-22).

## Notes
- Damage numbers are in `config.ts`.
