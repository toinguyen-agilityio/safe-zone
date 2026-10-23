# S-21: Take damage, armor absorbs it, and deaths are recorded

- **Priority:** P0 (milestone M3 Combat)
- **Covers:** FR-12 · **Decisions:** NFR-05
- **Depends on stories:** S-18

## User story
As a player, I want health 100 and armor that blocks part of the damage, and I want to know who killed whom, so that fights have consequences.

## Acceptance criteria
1. **Health**
   - Given a new match
   - When it starts
   - Then I and each bot have health 100
2. **Armor blocks 45%**
   - Given I have armor
   - When I take gun damage
   - Then 45% of it is blocked and the armor points drop, until its 60 points are used (unit test)
3. **Death**
   - Given my health reaches 0
   - When damage is applied
   - Then I am dead and can no longer move or shoot
4. **Who killed whom**
   - Given someone is killed
   - When the kill is recorded
   - Then the killer and the victim are stored for the kill count and the end screen

## Out of scope
- Showing health on screen (S-35); picking up armor (S-33); zone damage (S-30).

## Notes
- Armor is the raincoat (áo mưa).
