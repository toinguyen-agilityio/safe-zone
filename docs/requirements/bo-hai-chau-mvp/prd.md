# PRD: Bo Hải Châu MVP

- Slug: `bo-hai-chau-mvp` · Analysis: `requirements.md` (signed off 2026-10-23) · Version: 1
- Epic title: Bo Hải Châu MVP: offline browser battle royale in Da Nang

## 1. Summary
We build an offline browser battle-royale game set in central Da Nang (Hải Châu): one player plus 19 bots, a 5-7 minute match, flood water as the shrinking zone, one rifle, loot and healing food. It runs locally on desktop Chrome with keyboard and mouse, so the stakeholder and friends can play and give feedback.

## 2. Goals and success metrics
| Goal | Metric | Target |
|---|---|---|
| Full match loop works | Start screen, parachute, fight, win or lose, replay | Works end to end (S-38, S-16, S-40) |
| Da Nang is recognizable | Hàn river, Dragon Bridge, other landmarks | River, Dragon Bridge and 3 more landmarks (S-05, S-09, S-10) |
| Smooth play | Frame rate on integrated-GPU laptop, Chrome, 1080p | About 60 FPS (NFR-01, S-41) |
| Small bundle | JS size gzip | Under 1 MB (NFR-02, S-41) |
| Fair, right-length match | Match length; new player win rate | 5-7 min; about 1 in 5 (NFR-13, S-42) |
| Quality and safety | Unit tests, content review | Pure logic tested (NFR-05); content rules met (NFR-03, NFR-04) |

## 3. Users
The player (a friend of the stakeholder on desktop Chrome), the 19 bots, and the stakeholder/maintainer who runs the playtest.

## 4. Scope
- **In this release:** FR-01..FR-05, FR-08..FR-12, FR-14..FR-26, FR-29..FR-37, FR-40..FR-42, FR-44..FR-46, and the NFRs, with setup, CI, performance, balance, content review, README and playtest as stories (NFR-14).
- **Out / later:** P1 requirements FR-06, FR-07, FR-13, FR-27, FR-38, FR-39, FR-43 (deferred, Q-02); FR-28 difficulty levels (P2); GitHub Pages deploy and hosting (Q-04, Q-11: the stakeholder deploys later, outside the board); prototype migration (none exists, Q-03); multiplayer, mobile, vehicles, real map data, more guns, accounts, recorded audio, plan Phases 2-5.

## 5. Requirements
Confirmed FRs and NFRs are in `requirements.md`; not restated here.
| ID | Summary | Decided by |
|---|---|---|
| FR-01..FR-05, FR-08 | Map, river, bridges, houses, landmarks, seeded generation | plan |
| FR-09..FR-12, FR-14 | Player movement, parachute, health/armor, pause | plan |
| FR-15..FR-21 | Rifle, hitboxes, recoil, aiming, blocked bullets, firing limits, effects | plan |
| FR-22..FR-26 | Bots: drop, targeting, accuracy, zone following, unstuck | plan |
| FR-29..FR-33 | Flood zone phases, damage, visuals, announcements | plan |
| FR-34..FR-37 | Loot, carry limits, healing | plan |
| FR-40..FR-42, FR-44..FR-46 | Start screen, HUD, minimap, feed/toasts, end screen, touch notice | plan |
| NFR-12 | Mandatory tech stack | stakeholder note 2026-10-23 |
| NFR-14, NFR-16, NFR-17 | Non-feature stories tracked; stories then Team Lead tasks; milestones M0..M7 | Q-05, Q-01, Q-08 |
| NFR-15, NFR-07 | Vietnamese-only text; Chrome only | Q-07, Q-06 |
| NFR-02, NFR-08 | 1 MB bundle only; local run + CI, no deploy | Q-10, Q-04, Q-11 |

## 6. Key decisions
| Question | Decision |
|---|---|
| Q-01 | User stories on the board; the Team Lead splits tasks |
| Q-02 | P1 items out of the backlog until P0 is finished |
| Q-03 | No prototype; build from the plan only |
| Q-04, Q-09, Q-11 | Local run only; no deploy on the board; stakeholder deploys later by themself; CI stays |
| Q-05 | All non-feature work tracked, playtest run by the stakeholder with friends |
| Q-06 | Chrome only |
| Q-07 | Vietnamese in-game text only |
| Q-08 | Milestones M0..M7 with squad labels and sizes |
| Q-10 | Drop 4G / 3 s load target, keep 1 MB gzip |

## 7. Assumptions, deferred items and risks
- Assumptions (accepted at GATE 1): balance numbers missing from the plan (zone timings, damage per phase, bot names) are chosen during development and tuned in S-42 (A-04); all four landmarks are required (A-05).
- Deferred: seven P1 requirements (Q-02).
- Risks: 60 FPS with water shader and instanced city (R-01); 1 MB bundle with three.js (R-02); bot stuck-on-wall target hard to measure (R-06).

## 8. Story map
Delivery order by milestone (a few stories depend on a later-numbered one: S-27 needs S-29):
- M0 Setup: S-01, S-02, S-03, S-04
- M1 Map: S-05, S-06, S-07, S-08, S-09, S-10
- M2 Player: S-11, S-12, S-13, S-14, S-15, S-16
- M3 Combat: S-17, S-18, S-19, S-20, S-21, S-22, S-23
- M5 Zone (parallel with M4 after M3): S-29, S-30, S-31, S-32
- M4 Bots: S-24, S-25, S-26, S-27, S-28
- M6 Loot & UI: S-33, S-34, S-35, S-36, S-37, S-38, S-39, S-40
- M7 Release MVP: S-41, S-42, S-43, S-44, S-45
