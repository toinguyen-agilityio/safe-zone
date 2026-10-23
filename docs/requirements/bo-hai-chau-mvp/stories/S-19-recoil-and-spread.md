# S-19: Recoil and spread depend on how you move

- **Priority:** P0 (milestone M3 Combat)
- **Covers:** FR-17 · **Decisions:** NFR-06
- **Depends on stories:** S-17

## User story
As a player, I want the rifle to kick and spread more when I run or am in the air and less when I aim, so that careful shooting is rewarded.

## Acceptance criteria
1. **Recoil**
   - Given I fire continuously
   - When shots are fired
   - Then the view kicks up a little with each shot
2. **Spread grows when moving**
   - Given I run or am airborne
   - When I fire
   - Then bullets scatter more than when standing still
3. **Spread shrinks when aiming**
   - Given I am aiming down sights
   - When I fire
   - Then bullets scatter less than when not aiming
4. **Values in config**
   - Given the numbers
   - When I look for them
   - Then they are in `config.ts`

## Out of scope
- The aiming view itself (S-20).

## Notes
- Standing still with aim gives the best accuracy.
