# S-33: Loot lies on the sidewalks and is picked up by walking over it

- **Priority:** P0 (milestone M6 Loot & UI)
- **Covers:** FR-34, FR-35 · **Decisions:** Q-02 (bot looting deferred), NFR-15
- **Depends on stories:** S-15

## User story
As a player, I want banh mi (bánh mì), sugarcane juice (nước mía), ammo boxes and raincoats along the sidewalks that I pick up by walking over them, so that I can heal and stay armed.

## Acceptance criteria
1. **About 150 items**
   - Given a match starts
   - When the map is filled
   - Then about 150 items of the four types lie along sidewalks
2. **Valid places only**
   - Given the spawned items
   - When I check their positions
   - Then none is inside a house or in the river
3. **Auto pickup**
   - Given I walk over an item
   - When I touch it
   - Then it is picked up and removed from the ground
4. **Carry limits**
   - Given I carry 5 banh mi, 3 juice or 180 ammo
   - When I walk over another of that type
   - Then it is not picked up and stays on the ground
5. **Raincoat**
   - Given I pick up a raincoat
   - When it is added
   - Then my armor is restored toward its 60 points

## Out of scope
- Eating and drinking (S-34); bots picking up or dropping items (deferred, FR-27); pickup toast (S-36).

## Notes
- Item amounts and carry limits are in `config.ts`.
