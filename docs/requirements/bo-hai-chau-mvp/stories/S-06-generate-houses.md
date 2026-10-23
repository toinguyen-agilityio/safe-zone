# S-06: Houses are generated per block, the same way for the same seed

- **Priority:** P0 (milestone M1 Map)
- **Covers:** FR-04, FR-08 · **Decisions:** Q-03
- **Depends on stories:** S-04, S-05

## User story
As a player, I want tube houses (nhà ống) to fill each block between the streets with alleys (kiệt) to cut through, so that the city feels dense and repeatable.

## Acceptance criteria
1. **Houses per block**
   - Given the street layout
   - When houses are generated
   - Then each block is divided into houses with narrow alleys that cross the block
2. **No house on a street**
   - Given a generated map
   - When a unit test checks all houses
   - Then no house overlaps a street or the river
3. **Same seed, same map**
   - Given the same seed
   - When the map is generated twice
   - Then the houses are identical (house count and positions); a different seed gives a different result
4. **High-rises by the river**
   - Given a generated map
   - When I look at buildings next to the river
   - Then they are taller than houses in the inner blocks

## Out of scope
- Drawing the houses efficiently (S-07); landmarks (S-09, S-10).

## Notes
- The test checks house count and no overlap, as in the plan acceptance criteria.
