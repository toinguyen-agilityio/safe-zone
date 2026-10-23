# S-04: Central config, seeded random numbers and a steady game loop

- **Priority:** P0 (milestone M0 Setup)
- **Covers:** FR-08, NFR-06, NFR-10 · **Decisions:** NFR-12
- **Depends on stories:** S-01

## User story
As a developer, I want one config file, a seeded random generator and a stable game loop, so that balance values are in one place, results are repeatable and the game stays steady when the tab loses focus.

## Acceptance criteria
1. **Config file**
   - Given the project
   - When I look for game numbers such as speeds, damage and zone phases
   - Then they are defined in `config.ts` and not hard-coded elsewhere
2. **Same seed, same numbers**
   - Given a seed value
   - When the random generator is created twice with that seed
   - Then both produce the same sequence (covered by a unit test)
3. **Different seed**
   - Given two different seeds
   - When each generator produces numbers
   - Then the sequences differ
4. **Loop survives tab switch**
   - Given the game loop is running
   - When I switch to another tab and come back after several seconds
   - Then the game continues smoothly without a huge time jump

## Out of scope
- Using the seed to build the map (S-06).

## Notes
- The time step per frame is capped so a long pause does not break movement or timers.
