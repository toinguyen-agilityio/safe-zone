# S-28: Bots free themselves when stuck on walls

- **Priority:** P0 (milestone M4 Bots)
- **Covers:** FR-26 · **Decisions:** R-06
- **Depends on stories:** S-27

## User story
As a player, I want bots not to freeze against walls, so that matches do not stall and bots do not die for silly reasons.

## Acceptance criteria
1. **Detect stuck**
   - Given a bot makes no progress toward its goal
   - When this lasts a short time
   - Then the bot is treated as stuck
2. **Walk around**
   - Given a stuck bot
   - When it reacts
   - Then it walks around the obstacle
3. **Change target**
   - Given a bot stays stuck for a long time
   - When the long timeout is reached
   - Then it picks a different target or destination
4. **Few stuck deaths**
   - Given a full match of 19 bots
   - When the match ends
   - Then at most 2 bots died because they were stuck on walls

## Out of scope
- Navigation meshes (after MVP).

## Notes
- The "at most 2" target comes from the plan and is checked over several matches.
