# S-35: HUD shows health, armor, ammo, items, players alive, kills and zone clock

- **Priority:** P0 (milestone M6 Loot & UI)
- **Covers:** FR-41 · **Decisions:** NFR-15 (Vietnamese labels), NFR-12 (plain HTML + CSS)
- **Depends on stories:** S-17, S-29

## User story
As a player, I want an on-screen display of my status, so that I know how I am doing during the match.

## Acceptance criteria
1. **Health and armor**
   - Given a match is running
   - When I look at the screen
   - Then my health and armor values are shown and update when they change
2. **Ammo and items**
   - Given I fire or pick up items
   - When values change
   - Then the magazine, reserve ammo, banh mi count and juice count update
3. **Alive and kills**
   - Given someone is killed
   - When the kill happens
   - Then the players alive number and my kill count update
4. **Zone clock**
   - Given the zone is waiting or shrinking
   - When I look at the clock
   - Then it shows the time until the next change

## Out of scope
- Minimap (S-37); kill feed and toasts (S-36).

## Notes
- The HUD is part of the match screen entered from the start screen (S-38).
