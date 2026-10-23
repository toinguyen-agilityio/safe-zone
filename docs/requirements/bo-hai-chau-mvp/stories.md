# Stories: Bo Hải Châu MVP

Milestone (NFR-17) is shown per story. Board priority P1 for S-44 and S-45 is only an ordering hint, not the plan's P1 requirements.

## Stories
| ID | Title | Milestone | Priority | ACs | Covers |
|---|---|---|---|---|---|
| S-01 | Project starts and shows a spinning box | M0 | P0 | 4 | NFR-12 |
| S-02 | Lint, formatting and unit tests run locally | M0 | P0 | 3 | NFR-05, NFR-12 |
| S-03 | CI builds and tests every pull request | M0 | P0 | 4 | NFR-08, NFR-11 |
| S-04 | Central config, seeded random numbers and a steady game loop | M0 | P0 | 4 | FR-08, NFR-06, NFR-10 |
| S-05 | See the street grid and the Hàn river | M1 | P0 | 4 | FR-01, FR-02 |
| S-06 | Houses are generated per block, the same way for the same seed | M1 | P0 | 4 | FR-04, FR-08 |
| S-07 | Houses appear in the city and render efficiently | M1 | P0 | 4 | FR-04, NFR-01 |
| S-08 | Three bridges cross the river | M1 | P0 | 4 | FR-03 |
| S-09 | Dragon Bridge looks like a dragon | M1 | P0 | 3 | FR-05 |
| S-10 | Hàn Market, Cock Church and Cham Museum landmarks | M1 | P0 | 4 | FR-05 |
| S-11 | Look around and walk in first person | M2 | P0 | 3 | FR-09 |
| S-12 | Pause and resume with Esc | M2 | P0 | 3 | FR-14 |
| S-13 | Houses and map edge block the player | M2 | P0 | 5 | FR-01, NFR-05 |
| S-14 | Walk up and down bridge ramps, and sink to the river bed | M2 | P0 | 4 | FR-03 |
| S-15 | Sprint, jump and swim | M2 | P0 | 5 | FR-02, FR-03, FR-10 |
| S-16 | Parachute into the map at the start of the match | M2 | P0 | 4 | FR-11 |
| S-17 | Fire the AK-Mía rifle | M3 | P0 | 4 | FR-15, FR-20 |
| S-18 | Shots hit targets and are blocked by houses | M3 | P0 | 4 | FR-16, FR-19 |
| S-19 | Recoil and spread depend on how you move | M3 | P0 | 4 | FR-17 |
| S-20 | Aim down sights with the right mouse button | M3 | P0 | 3 | FR-18 |
| S-21 | Take damage, armor absorbs it, and deaths are recorded | M3 | P0 | 4 | FR-12 |
| S-22 | Visual feedback for shooting and being shot | M3 | P0 | 4 | FR-21 |
| S-23 | Synthesized sound for shots, hits and pickups | M3 | P0 | 5 | NFR-09 |
| S-24 | 19 bots parachute in and land across the map | M4 | P0 | 4 | FR-22 |
| S-25 | Bots spot the nearest enemy and attack it | M4 | P0 | 4 | FR-23 |
| S-26 | Bots shoot with reaction time and imperfect aim | M4 | P0 | 4 | FR-24 |
| S-27 | Bots move to the next dry zone | M4 | P0 | 3 | FR-25 |
| S-28 | Bots free themselves when stuck on walls | M4 | P0 | 4 | FR-26 |
| S-29 | The flood zone has 5 phases that shrink around new centers | M5 | P0 | 4 | FR-29, FR-30 |
| S-30 | Standing in the flood drains health | M5 | P0 | 4 | FR-31 |
| S-31 | Flood water covers the streets outside the zone | M5 | P0 | 4 | FR-32 |
| S-32 | Screen overlay and announcements for the flood | M5 | P0 | 4 | FR-32, FR-33 |
| S-33 | Loot lies on the sidewalks and is picked up by walking over it | M6 | P0 | 5 | FR-34, FR-35 |
| S-34 | Eat banh mi and drink sugarcane juice to heal | M6 | P0 | 4 | FR-36, FR-37 |
| S-35 | HUD shows health, armor, ammo, items, players alive, kills and zone clock | M6 | P0 | 4 | FR-41 |
| S-36 | Kill feed, pickup messages and banners | M6 | P0 | 4 | FR-44 |
| S-37 | Minimap that turns with my view | M6 | P0 | 3 | FR-42 |
| S-38 | Start screen with controls and a button to enter the match | M6 | P0 | 4 | FR-40 |
| S-39 | Notice on touch devices that they are not supported | M6 | P0 | 3 | FR-46 |
| S-40 | End screen with results and replay | M6 | P0 | 5 | FR-45 |
| S-41 | Measure and improve performance | M7 | P0 | 4 | NFR-01, NFR-02 |
| S-42 | Balance the match | M7 | P0 | 4 | NFR-06, NFR-13 |
| S-43 | Content review for legal and sensitivity rules | M7 | P0 | 5 | NFR-03, NFR-04 |
| S-44 | README with introduction, controls and how to run locally | M7 | P1 | 4 | NFR-11, NFR-14 |
| S-45 | Playtest with 5 people | M7 | P1 | 3 | NFR-14 |

## FR → Story traceability
In-scope FRs only. Deferred FRs (Q-02): FR-06, FR-07, FR-13, FR-27, FR-38, FR-39, FR-43. Out of scope: FR-28.

| FR | Stories |
|---|---|
| FR-01 | S-05, S-13 |
| FR-02 | S-05, S-15 |
| FR-03 | S-08, S-14, S-15 |
| FR-04 | S-06, S-07 |
| FR-05 | S-09, S-10 |
| FR-08 | S-04, S-06 |
| FR-09 | S-11 |
| FR-10 | S-15 |
| FR-11 | S-16 |
| FR-12 | S-21 |
| FR-14 | S-12 |
| FR-15 | S-17 |
| FR-16 | S-18 |
| FR-17 | S-19 |
| FR-18 | S-20 |
| FR-19 | S-18 |
| FR-20 | S-17 |
| FR-21 | S-22 |
| FR-22 | S-24 |
| FR-23 | S-25 |
| FR-24 | S-26 |
| FR-25 | S-27 |
| FR-26 | S-28 |
| FR-29 | S-29 |
| FR-30 | S-29 |
| FR-31 | S-30 |
| FR-32 | S-31, S-32 |
| FR-33 | S-32 |
| FR-34 | S-33 |
| FR-35 | S-33 |
| FR-36 | S-34 |
| FR-37 | S-34 |
| FR-40 | S-38 |
| FR-41 | S-35 |
| FR-42 | S-37 |
| FR-44 | S-36 |
| FR-45 | S-40 |
| FR-46 | S-39 |

## NFR → Story traceability
| NFR | Stories |
|---|---|
| NFR-01 | S-07, S-41 |
| NFR-02 | S-41 |
| NFR-03 | S-10, S-23, S-38, S-43 |
| NFR-04 | S-10, S-22, S-40, S-43 |
| NFR-05 | S-02, S-13, S-18, S-21, S-25, S-29, S-30 |
| NFR-06 | S-04, S-42 |
| NFR-07 | S-11, S-38, S-41 |
| NFR-08 | S-03 |
| NFR-09 | S-23 |
| NFR-10 | S-04 |
| NFR-11 | S-03, S-44 |
| NFR-12 | S-01, S-02 |
| NFR-13 | S-42 |
| NFR-14 | S-01..S-04, S-41..S-45 |
| NFR-15 | S-10, S-12, S-24, S-32, S-33, S-35..S-40 |
| NFR-16 | all stories |
| NFR-17 | all stories (milestone column) |

## Size self-check
Limit: `limits.story_max_ac` = 5.

| Story | ACs | ≤ limit? | Split pattern used |
|---|---|---|---|
| S-01..S-04 | 4, 3, 4, 4 | yes | simple version first |
| S-05..S-10 | 4, 4, 4, 4, 3, 4 | yes | by data type (map element) |
| S-11..S-16 | 3, 3, 5, 4, 5, 4 | yes | by workflow (look, pause, collide, ground, move, drop) |
| S-17..S-23 | 4, 4, 4, 3, 4, 4, 5 | yes | by business rule (fire, hit, recoil, aim, damage, effects, sound) |
| S-24..S-28 | 4, 4, 4, 3, 4 | yes | by workflow (T-403 "L" split into targeting and shooting) |
| S-29..S-32 | 4, 4, 4, 4 | yes | by business rule (phases, damage, visuals, messages) |
| S-33..S-40 | 5, 4, 4, 4, 3, 4, 3, 5 | yes | by data type and screen |
| S-41..S-45 | 4, 4, 5, 4, 3 | yes | one concern per story |

Screen entry check: S-12 (Esc during match), S-32 and S-36 messages (shown in match), S-35 and S-37 (match screen entered from S-38), S-38 (home page), S-39 (shown on page load), S-40 (shown automatically at match end, replay button starts a new match).
