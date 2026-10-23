# S-27: Bots move to the next dry zone

- **Priority:** P0 (milestone M4 Bots)
- **Covers:** FR-25 · **Decisions:** BR-05
- **Depends on stories:** S-26, S-29

## User story
As a player, I want bots to run into the next dry zone before the water rises, so that they stay in the match and meet me there.

## Acceptance criteria
1. **Heads for dry zone**
   - Given the zone is about to shrink
   - When the warning time starts
   - Then bots outside the next dry zone start moving toward it
2. **Picks a destination**
   - Given a bot is moving to the zone
   - When it chooses where to go
   - Then it picks a point inside the next dry zone
3. **Still fights**
   - Given a bot is moving and sees an enemy
   - When it is in danger or close
   - Then it may stop to fight

## Out of scope
- Getting unstuck from walls (S-28).

## Notes
- Zone phases are defined in S-29.
