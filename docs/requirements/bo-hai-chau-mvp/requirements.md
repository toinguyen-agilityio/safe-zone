# Requirement analysis: Bo Hải Châu MVP

Signed-off: 2026-10-23 by Toi Nguyen

- Slug: `bo-hai-chau-mvp`
- Status: Signed off
- Sources: see the table below

## Changelog
| Date | Round | Change |
|---|---|---|
| 2026-10-23 | 1 | Initial analysis. Stakeholder note of 2026-10-23 applied: tech stack in plan section 2 is mandatory (recorded as NFR-12, no question needed). Ticket granularity not answered (Q-01 stays open). |
| 2026-10-23 | 4 | Q-11 = A confirmed: board covers local run and CI only; the stakeholder deploys later outside the board. NFR-08 final; AMB-06, C-03, G-06, A-09 closed. No open questions remain. |
| 2026-10-23 | 3 | Q-08 = A confirmed (NFR-17, AMB-05 resolved). Q-10 = A confirmed (NFR-02 = 1 MB gzip only, A-08 closed). Q-09 confirmed as information (friends will play via a web version the stakeholder deploys later) but it conflicts with Q-04 on deploy scope: NFR-08 marked provisional, AMB-06 and follow-up Q-11 added. |
| 2026-10-23 | 2 | Answers Q-01..Q-07 applied and confirmed: Q-01 = user stories then Team Lead splits tasks (AMB-01, C-01 resolved); Q-02 = P1 out of the backlog until P0 is finished (FR-06/07/13/27/38/39/43 moved to deferred scope); Q-03 = no prototype, build from the plan only (G-01, R-03 closed; migration wording removed); Q-04 = local run only, no hosting, so the Pages deploy goal and plan T-004 are out, CI stays (NFR-08 rewritten, G-02/A-03 closed); Q-05 = all non-feature work tracked on the board, playtest by the stakeholder with friends (new NFR-14); Q-06 = Chrome only (NFR-07); Q-07 = Vietnamese-only in-game text (NFR-15). New follow-ups Q-09 (how friends run the game for the playtest) and Q-10 (does the 4G load-time target still apply without hosting). |

## Sources
| ID | File (in `sources/`) | Origin | Retrieved | Notes |
|---|---|---|---|---|
| SRC-1 | `plan.md` | `docs/requirements/plan.md` | 2026-10-23 | Vietnamese requirements and plan; plan IDs (MAP-01, T-104 ...) are cited as "plan §x ID" |
| SRC-2 | `stakeholder-brief.md` | stakeholder (typed) | 2026-10-23 | "Analyze, and create tickets on the GitHub project board" |
| SRC-3 | `stakeholder-notes.md` | stakeholder (typed) | 2026-10-23 | Stack is mandatory; granularity question not answered |

## 1. Business goal and problem statement
A browser battle-royale game (three.js) set in central Da Nang (Hải Châu district). The player parachutes in, loots, fights and runs from a "zone" that is rising flood water; the last survivor "eats Quảng noodles (mì Quảng)" (SRC-1 intro). MVP = one offline match, 1 player + 19 bots, 5-7 minutes, desktop browser (SRC-1 §1). Per Q-04 the game is run locally only: the plan's GitHub Pages deploy and public link are dropped.
MVP done when: start screen -> parachute -> fight -> win or lose -> replay works; Da Nang is recognizable (Hàn river, Dragon Bridge, at least 3 landmarks); 60 FPS on a mid-range integrated-GPU laptop in current Chrome; the game is built from the plan in a structured repo with tests and CI (SRC-1 §1; no prototype exists to migrate, Q-03). The stakeholder wants the work analyzed and turned into tickets on the GitHub board (SRC-2).

## 2. Actors / personas
| Actor | Description | Goals |
|---|---|---|
| Player | Friend of the stakeholder, desktop browser, keyboard + mouse | Play a full match, win, replay |
| Bot | 19 AI opponents with funny Vietnamese names, conical hats (nón lá) | Fight player and each other, follow the zone |
| Stakeholder / maintainer | Owns the game and repo | Ship MVP link to friends, collect playtest feedback |

## 3. Functional requirements
Plan priority: P0 = required for MVP, P1 = in MVP if time allows, P2 = after MVP (SRC-1 §3). Status `deferred (Q-02)` = P1, stakeholder decided to leave P1 out of the backlog until P0 is finished (kept here so they can be added later; not in current scope).

| ID | Requirement | Source | Status |
|---|---|---|---|
| FR-01 | Map about 640x640 units, street grid modelled on Hải Châu, with a boundary the player cannot leave | SRC-1 §3.1 MAP-01 | confirmed (plan) |
| FR-02 | Hàn river along the east side, gently curved; entering it makes the player swim | MAP-02 | confirmed (plan) |
| FR-03 | 3 bridges with ramps (Hàn River Bridge, Dragon Bridge, Trần Thị Lý Bridge); swimming under bridges is possible | MAP-03 | confirmed (plan) |
| FR-04 | Tube houses (nhà ống) generated per block between streets, with alleys (kiệt) crossing blocks; high-rises near the river | MAP-04 | confirmed (plan) |
| FR-05 | Landmarks: Dragon Bridge (body, head), Hàn Market, Cock Church (Nhà thờ Con Gà), Cham Museum | MAP-05 | confirmed (plan) |
| FR-06 | Player can stand on rooftops after landing from the parachute | MAP-06 (P1) | deferred (Q-02) |
| FR-07 | Decorations: stainless water tanks on roofs, tree rows along Bạch Đằng, Sơn Trà hill in the distance | MAP-07 (P1) | deferred (Q-02) |
| FR-08 | Map generation is deterministic by seed (same seed, same map) | MAP-08 | confirmed (plan) |
| FR-09 | First-person view, WASD move, mouse look (pointer lock) | PLR-01 | confirmed (plan) |
| FR-10 | Sprint (Shift), jump (Space), slow swim in river | PLR-02 | confirmed (plan) |
| FR-11 | Opening parachute drop from about 75 m, steerable with WASD, Space to fall faster | PLR-03 | confirmed (plan) |
| FR-12 | Health 100; armor (raincoat, áo mưa) 60 points blocking 45% of gun damage | PLR-04 | confirmed (plan) |
| FR-13 | Fallback when the browser refuses pointer lock: hold right mouse to look, P to pause | PLR-05 (P1) | deferred (Q-02) |
| FR-14 | Esc pauses the match; click to resume | PLR-06 | confirmed (plan) |
| FR-15 | One automatic rifle ("AK-Mía"): 30-round magazine, 1.8 s reload, hitscan | CMB-01 | confirmed (plan) |
| FR-16 | Hitboxes head (x2 damage), torso, legs | CMB-02 | confirmed (plan) |
| FR-17 | Recoil and spread grow when running or airborne, shrink when aiming | CMB-03 | confirmed (plan) |
| FR-18 | Aim down sights with right mouse (reduced FOV, gun centered) | CMB-04 | confirmed (plan) |
| FR-19 | Bullets are blocked by houses | CMB-05 | confirmed (plan) |
| FR-20 | Cannot shoot while swimming, parachuting or sprinting | CMB-06 | confirmed (plan) |
| FR-21 | Effects: tracer, muzzle flash, hitmarker (yellow for head), incoming-damage direction indicator | CMB-07 | confirmed (plan) |
| FR-22 | 19 bots parachute to random positions, have funny Vietnamese names and conical hats | BOT-01 | confirmed (plan) |
| FR-23 | Bots find the nearest enemy in line of sight and attack both the player and other bots | BOT-02 | confirmed (plan) |
| FR-24 | Bots have reaction time; hit chance falls with distance and when the target runs or jumps | BOT-03 | confirmed (plan) |
| FR-25 | Bots move to the next dry zone before the zone shrinks | BOT-04 | confirmed (plan) |
| FR-26 | Bots free themselves when stuck on walls (walk around) and change target when stuck long | BOT-05 | confirmed (plan) |
| FR-27 | Bots pick up items they pass and drop items on death | BOT-06 (P1) | deferred (Q-02) |
| FR-28 | Bot difficulty (easy/normal/hard) via `config.ts` | BOT-07 (P2) | out of scope (after MVP) |
| FR-29 | Zone has 5 phases (wait then shrink); radii 230, 130, 68, 30, 6 | ZON-01 | confirmed (plan); durations missing (G-03) |
| FR-30 | Each new zone center lies inside the previous zone and avoids the middle of the river | ZON-02 | confirmed (plan) |
| FR-31 | Outside the dry zone health drains, rate rising by phase from 1 to 12 HP/s | ZON-03 | confirmed (plan) |
| FR-32 | Zone display: flood water surface on streets outside the zone (shader), cylindrical water wall, screen overlay while outside | ZON-04 | confirmed (plan) |
| FR-33 | Announcements when water starts rising and when a new dry zone appears | ZON-05 | confirmed (plan) |
| FR-34 | About 150 items along sidewalks: banh mi (bánh mì), sugarcane juice (nước mía), ammo boxes, raincoats | LOT-01 | confirmed (plan) |
| FR-35 | Auto pickup when walking over; carry limits 5 banh mi, 3 juice, 180 ammo | LOT-02 | confirmed (plan) |
| FR-36 | Key 1: eat banh mi (2 s, +30 HP). Key 2: drink juice (1.2 s, +15 HP, sprint buff 8 s) | LOT-03 | confirmed (plan) |
| FR-37 | While eating/drinking the player moves slowly; shooting or being shot cancels it | LOT-04 | confirmed (plan) |
| FR-38 | Dragon Bridge head breathes fire toward Võ Văn Kiệt at seconds 110, 250, 380, 6.5 s each | EVT-01 (P1) | deferred (Q-02) |
| FR-39 | 6 s warning before fire; anyone in the fire area loses health | EVT-02 (P1) | deferred (Q-02) |
| FR-40 | Start screen: game name, description, controls, enter-match button; background camera flying around the Hàn river | UI-01 | confirmed (plan) |
| FR-41 | HUD: health, armor, ammo, consumables, players alive, kills, zone clock | UI-02 | confirmed (plan) |
| FR-42 | Minimap rotating with view direction, showing current and next zone | UI-03 | confirmed (plan) |
| FR-43 | Large map (key M) with street names and landmarks | UI-04 (P1) | deferred (Q-02) |
| FR-44 | Kill feed (max 5 lines), pickup toast, event banner | UI-05 | confirmed (plan) |
| FR-45 | End screen: rank, kills, damage, survival time, line depending on how the player died, replay button | UI-06 | confirmed (plan) |
| FR-46 | Unsupported-device notice when opened on a touch device | UI-07 | confirmed (plan) |

## 4. Non-functional requirements
| ID | Category | Requirement | Source |
|---|---|---|---|
| NFR-01 | Performance | 60 FPS on integrated-GPU laptop at 1080p; max pixel ratio 1.5 | SRC-1 §3.9 NFR-01 |
| NFR-02 | Performance | JS bundle under 1 MB gzip. The 3 s / 4G first-load target is dropped | SRC-1 NFR-02; Q-10 = A |
| NFR-03 | Legal/IP | No copyrighted assets; no PUBG name/UI/assets; no real brand names on the map | NFR-03 |
| NFR-04 | Content | No government-agency buildings; cartoon violence, no gore | NFR-04 |
| NFR-05 | Quality | Pure logic (collision, zone, damage, LOS) has unit tests | NFR-05 |
| NFR-06 | Maintainability | All balance parameters live in `config.ts` | NFR-06 |
| NFR-07 | Platform | Desktop browser, keyboard + mouse; current Chrome only, other browsers best effort | SRC-1 §1; Q-06 = A |
| NFR-08 | Delivery | Runs locally only; no hosting and no deploy (plan T-004 / GitHub Pages dropped). Build and tests still run on every PR (CI stays) | Q-04 ("Tôi chỉ muốn chạy ở local"); SRC-1 §2 (CI part); Q-11 = A (stakeholder deploys to the web later, outside the board; no deploy ticket on the board) |
| NFR-09 | Audio | Synthesized sound only (Web Audio), no audio files; sound starts only after the player's first click | SRC-1 §2, T-306 |
| NFR-10 | Determinism | Seeded RNG | SRC-1 T-005 |
| NFR-11 | Definition of Done (all work) | Merged to `main` via PR with green CI; pure logic has unit tests; new parameters in `config.ts`; tried on desktop Chrome with no FPS drop; README updated for visible features/controls | SRC-1 §6 |
| NFR-12 | Technology constraint (MANDATORY) | Vite + TypeScript; three.js (single pinned version, `InstancedMesh` for houses and trees); own AABB 2D collision + spatial grid (no physics engine yet); plain HTML + CSS UI (no UI framework); Web Audio synthesized sound; Vitest; ESLint + Prettier; GitHub Actions to GitHub Pages | SRC-1 §2; SRC-3 2026-10-23 ("tech stack ở mục 2 là bắt buộc") |
| NFR-13 | Match length | Match lasts about 5-7 minutes; a new player should win roughly 1 in 5 matches | SRC-1 §1, T-702 |
| NFR-14 | Process | Non-feature work is tracked on the board too: repo setup and CI (T-001..T-003, T-005), performance (T-701), balance (T-702), content review (T-703), README (T-704), and a playtest with 5 people run by the stakeholder with friends (T-705); deploy T-004 excluded by Q-04 | Q-05 = A; Q-04 |
| NFR-15 | i18n | All in-game text (menus, HUD, announcements, end-screen lines) is Vietnamese only | Q-07 = A |
| NFR-17 | Board organization | Use GitHub milestones M0 Setup to M7 Release MVP as in plan §7, with the squad's own labels and sizes (XS/S/M) | Q-08 = A |
| NFR-16 | Backlog shape | Board holds user stories grouped by plan requirement IDs; the Team Lead splits them into tasks (plan T-xxx are references, not 1:1 issues) | Q-01 = B |

## 5. Scope
- **In:** all plan P0 items, built from the plan; repo setup, CI, perf pass, balance pass, content review, README and the playtest from plan M0 and M7 (NFR-14), as user stories (NFR-16).
- **Out:** multiplayer, mobile/touch, vehicles, real OpenStreetMap data, multiple gun types, accounts/leaderboards, pre-recorded audio (SRC-1 §1); BOT-07 difficulty levels (P2); everything in plan §5 (Phases 2-5); GitHub Pages deploy / hosting (Q-04); P1 items for now (Q-02, revisit after P0); migration of a prototype (none exists, Q-03).

## 6. Business rules and data entities
- BR-01: Last survivor wins; the player loses when health reaches 0 (SRC-1 intro, UI-06).
- BR-02: Armor blocks 45% of gun damage until its 60 points are used (PLR-04).
- BR-03: Head hits deal double damage (CMB-02).
- BR-04: Healing is cancelled by shooting or taking damage (LOT-04).
- BR-05: Zone centers nest inside the previous zone and avoid the middle of the river (ZON-02).
- BR-06: No firing while swimming, parachuting or sprinting (CMB-06).
- Entities: Match, Player, Bot, Weapon (AK-Mía), Item (banh mi, sugarcane juice, ammo box, raincoat), Zone phase (radius, center, damage per second), Map layout (streets, river, bridges, landmarks, houses), Event (dragon fire).

## 7. Gaps (missing information)
- G-01 (closed): prototype file does not exist; build from the plan only → Q-03 confirmed
- G-02 (closed): no hosting, local run only → Q-04 confirmed
- G-06 (closed): friends will play on a web version the stakeholder deploys later, outside the board (Q-09, Q-11 confirmed)
- G-03: Zone wait/shrink durations, damage numbers per phase between 1 and 12, bot names list and other balance values are not given; plan T-702 tunes them → A-04 (no question unless stakeholder wants control)
- G-04 (closed): stakeholder runs the playtest with friends → Q-05 confirmed
- G-05 (closed): Vietnamese only → Q-07 confirmed

## 8. Ambiguities (more than one reading)
- AMB-01 (resolved, Q-01 = B; AMB-02..04 resolved by Q-02, Q-05, Q-06; AMB-05 still open → Q-08): Ticket granularity. Stakeholder wrote "theo từng T-xxx của plan, hay theo user story rồi Team Lead tách task" without choosing. Readings: (a) one issue per plan T-xxx; (b) user stories on the board, the Team Lead splits them into tasks → Q-01
- AMB-02: P1 items are "should have in MVP if time allows". Readings: (a) include all P1 stories now (b) include some (c) exclude → Q-02
- AMB-03: Plan T-001 to T-005, T-701 to T-705 are technical or process work with no player-visible behavior. Readings: tracked as tickets of their own, folded into feature stories, or left out → Q-05
- AMB-04: Browser support: "Chrome latest" is the performance target; other desktop browsers are not mentioned → Q-06
- AMB-05 (resolved, Q-08 = A): Plan §7 proposes its own milestones, labels and issue template; milestones M0-M7 are used with the squad's labels and sizes (NFR-17).
- AMB-06 (resolved, Q-11 = A: reading (a), stakeholder deploys outside the backlog): Deploy scope. Q-04 "Tôi chỉ muốn chạy ở local" vs Q-09 "Tôi sẽ deploy lên web để bạn bè chơi sau". Readings: (a) stakeholder deploys by themself outside the backlog; (b) Pages deploy returns to the backlog → Q-11

## 9. Conflicts (sources disagree)
- C-01 (resolved, Q-01 = B): SRC-1 §4 sizes tickets S/M/L with T-403 = L vs the board allows only XS/S/M. Stories are split by the Team Lead, so no L tickets reach the board.
- C-03 (resolved, Q-04): SRC-1 §1 "deploy to GitHub Pages to send a link to friends" and T-004 vs stakeholder "Tôi chỉ muốn chạy ở local". Stakeholder answer wins; deploy dropped.
- C-02: SRC-1 §1 says "at least 3 landmarks" vs MAP-05 lists Dragon Bridge, Hàn Market, Cock Church, Cham Museum (4; Dragon Bridge is also a bridge) → treated as 4 required (A-05)

## 10. Assumptions (provisional until confirmed)
- A-01: Tech stack is fixed (confirmed by stakeholder, SRC-3); no question needed.
- A-02 (closed): P1 items are not in the backlog now (Q-02 confirmed).
- A-03 (closed): replaced by local-only (Q-04 confirmed).
- A-08 (closed): 4G / 3 s target dropped, 1 MB gzip kept (Q-10 confirmed).
- A-09 (closed): deploy is outside the backlog (Q-11 confirmed).
- A-04: Balance values not in the plan are chosen during development and tuned in plan T-702; all in `config.ts` (NFR-06).
- A-05: All four landmarks of MAP-05 are required, which satisfies "at least 3".
- A-06 (closed): Vietnamese only (Q-07 confirmed)
- A-07: Plan IDs (MAP-01 ...) are the stakeholder's own reference and will be kept in story `Covers:` for traceability.

## 11. Risks and external dependencies
- R-01: 60 FPS on integrated GPU with water shader, 20 characters and instanced city is demanding (NFR-01, T-701).
- R-02: Bundle under 1 MB gzip with three.js is tight (NFR-02).
- R-03 (closed): no prototype; the game is built from the plan only, so visual/behavior details come from plan text and are tuned in balance (T-702).
- R-04: Legal: game license (G1) check before public release or charging money is post-MVP (SRC-1 §5 Phase 5); local-only use keeps MVP clear of it.
- R-05: Pointer lock refusal in some browsers (PLR-05 deferred as P1); Chrome only reduces this.
- R-06: Bot "stuck on wall" quality target (no more than 2 bot deaths from getting stuck per match, T-404) is hard to measure.
