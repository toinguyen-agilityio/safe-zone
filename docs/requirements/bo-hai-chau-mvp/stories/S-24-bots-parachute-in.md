# S-24: 19 bots parachute in and land across the map

- **Priority:** P0 (milestone M4 Bots)
- **Covers:** FR-22 · **Decisions:** NFR-15 (Vietnamese names), NFR-03, NFR-04
- **Depends on stories:** S-16

## User story
As a player, I want 19 opponents with funny Vietnamese names and conical hats to drop in with me, so that the match feels like a battle royale.

## Acceptance criteria
1. **19 bots**
   - Given a match starts
   - When the drop begins
   - Then 19 bots parachute from random positions
2. **Look**
   - Given a bot is visible
   - When I look at it
   - Then it has a body, head, conical hat (nón lá) and a parachute while falling
3. **Names**
   - Given a bot
   - When its name is shown
   - Then it is a funny Vietnamese name
4. **Spread out**
   - Given all bots have landed
   - When I check where they are
   - Then they are spread across the whole map and not inside houses

## Out of scope
- Bot behavior on the ground (S-25 to S-28); bot loot (deferred P1, FR-27).

## Notes
- Bot names are cartoon-style jokes, no real brands or officials.
