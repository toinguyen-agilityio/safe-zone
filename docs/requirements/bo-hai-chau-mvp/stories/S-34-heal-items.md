# S-34: Eat banh mi and drink sugarcane juice to heal

- **Priority:** P0 (milestone M6 Loot & UI)
- **Covers:** FR-36, FR-37 · **Decisions:** BR-04
- **Depends on stories:** S-33, S-21

## User story
As a player, I want to press 1 to eat banh mi and 2 to drink sugarcane juice, so that I recover health in the middle of a fight.

## Acceptance criteria
1. **Banh mi**
   - Given I carry banh mi and am hurt
   - When I press 1
   - Then after 2 s I gain 30 health and one banh mi is used
2. **Sugarcane juice**
   - Given I carry juice
   - When I press 2
   - Then after 1.2 s I gain 15 health, run faster for 8 s and one juice is used
3. **Slow while using**
   - Given I am eating or drinking
   - When I move
   - Then I move slowly
4. **Cancel**
   - Given I am eating or drinking
   - When I shoot or get shot
   - Then it is cancelled and the item is not used

## Out of scope
- Showing item counts on screen (S-35).

## Notes
- Health never goes above 100.
