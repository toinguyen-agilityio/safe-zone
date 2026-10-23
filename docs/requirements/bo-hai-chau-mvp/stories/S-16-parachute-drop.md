# S-16: Parachute into the map at the start of the match

- **Priority:** P0 (milestone M2 Player)
- **Covers:** FR-11 · **Decisions:** Q-02 (rooftop landing deferred)
- **Depends on stories:** S-15

## User story
As a player, I want to start the match by parachuting from the sky and steering down, so that I choose where to land.

## Acceptance criteria
1. **Start high**
   - Given a match starts
   - When the first frame appears
   - Then I am about 75 m above the map under a parachute
2. **Steer**
   - Given I am falling
   - When I press WASD
   - Then I drift in that direction while descending
3. **Fall faster**
   - Given I am falling
   - When I hold Space
   - Then I descend faster
4. **Landing**
   - Given I reach the ground
   - When I touch down
   - Then I land on the ground (not inside a house) and control switches to walking

## Out of scope
- Landing on rooftops (deferred P1, FR-06); bots dropping (S-24).

## Notes
- Falling speed values come from `config.ts`.
