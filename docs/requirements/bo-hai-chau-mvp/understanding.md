# How I understand it: Bo Hải Châu MVP (final, for sign-off)

**What it is.** A browser battle-royale game set in central Da Nang. You parachute onto a map with the Hàn river, three bridges (including the Dragon Bridge), tube houses and landmarks. You loot food and ammo, fight 19 bots with one rifle, and run from rising flood water instead of a shrinking circle. Last one alive wins.

**MVP scope.** One offline match (1 player + 19 bots), 5-7 minutes, desktop Chrome with keyboard and mouse, 60 FPS on a mid-range laptop. Flow: start screen, parachute, fight, win or lose, replay. Built from the plan only (no prototype exists).

**Decided by you.**
- Technology in plan section 2 is mandatory (Vite, TypeScript, three.js, own collision, plain HTML/CSS, Web Audio, Vitest, ESLint/Prettier, GitHub Actions for CI).
- The board holds user stories; the Team Lead splits them into tasks. GitHub milestones M0 to M7 from the plan are used, with the squad's labels and sizes.
- Only P0 items are in the backlog. P1 items (rooftops, decorations, pointer-lock fallback, bot looting, dragon fire event, big map) wait until P0 is finished.
- The board covers local run and CI (build and tests on each PR). There is no deploy work: you will deploy to the web yourself later, outside the board, so friends can play.
- Setup, performance, balance, content review, README and the playtest are tracked on the board; you run the playtest with friends.
- Chrome only; all in-game text in Vietnamese.
- JS bundle under 1 MB gzip; the 4G / 3 s load target is dropped.

**Key rules.** Health 100; raincoat armor blocks 45% damage; headshots double; no shooting while swimming, parachuting or sprinting; healing is cancelled when you shoot or get shot; five zone phases (radius 230 down to 6, damage 1 to 12 per second); same seed gives the same map; all balance numbers live in one config file; no copyrighted or PUBG assets, no real brands, no government buildings, cartoon violence only.

**Out of scope.** Multiplayer, mobile, vehicles, real map data, more guns, accounts, recorded audio, bot difficulty levels, deploy and hosting, P1 items for now, plan Phases 2-5.

**Still assumed.** Balance numbers missing from the plan (zone timings, damage per phase, bot names) are chosen during development and tuned in the balance task; "at least 3 landmarks" means all four listed (Dragon Bridge, Hàn Market, Cock Church, Cham Museum).

**Deferred items.** The seven P1 requirements above (stakeholder decision Q-02).
