# Clarifying questions: Bo Hải Châu MVP

- Slug: `bo-hai-chau-mvp`
- Open: 0 · Answered: 0 · Confirmed: 11 · Deferred: 0
- Next batch to ask: none (all confirmed)

Rules: the PM asks each question **verbatim** (translation allowed, no rephrasing, merging or
answering) and records the answer verbatim plus an English translation. Only the BA changes a
status to `confirmed` or `deferred`.

Not asked (already answered): the tech stack in plan section 2 is mandatory (NFR-12, stakeholder note 2026-10-23).

---

### Q-01: Ticket granularity on the board
- **Question:** Should the board hold one issue per plan ticket (T-001, T-002, ...), or user stories that you approve and the Team Lead then splits into technical tasks?
- **Why it matters:** Decides the whole shape of the backlog: number of items, who writes the acceptance criteria, whether plan T-xxx sizes (including the L ticket T-403) are kept or re-split. Guessing wrong means redoing the backlog.
- **Related:** AMB-01, C-01, NFR-12
- **Options:**
  - A) One issue per plan T-xxx, taken as-is from the plan
  - B) User stories (grouped by plan requirement IDs), then the Team Lead splits them into tasks
  - C) Other (please describe)
- **Answer (original):** B
- **Answer (English):** B) User stories, then the Team Lead splits them into tasks
- **Status:** confirmed
- **BA note:** Applied as NFR-16: user stories, Team Lead splits tasks. Resolves AMB-01, C-01.

### Q-02: Are the P1 items part of this MVP backlog?
- **Question:** The plan marks some requirements P1 ("should have if time allows"): standing on rooftops, decorations, pointer-lock fallback, bot loot pickup/drop, Dragon Bridge fire event, big map (key M). Should these be on the board now?
- **Why it matters:** Changes scope by about 6 requirements and their tickets (T-109, T-405, T-603, part of T-204/T-605).
- **Related:** AMB-02, A-02, FR-06, FR-07, FR-13, FR-27, FR-38, FR-39, FR-43
- **Options:**
  - A) Yes, include all P1 as lower-priority items after P0
  - B) Include only some (please list which)
  - C) No, leave P1 out until P0 is finished
- **Answer (original):** C
- **Answer (English):** C) No, leave P1 out until P0 is finished
- **Status:** confirmed
- **BA note:** Read as: P1 items are not on the board now; revisit after P0. FR-06/07/13/27/38/39/43 marked deferred (out of current scope).

### Q-03: The existing prototype file
- **Question:** The plan says a single-file HTML prototype already exists as the reference. Where is it, and can you add it to the repository (or send it) so the analysis and developers can use it?
- **Why it matters:** The MVP is a migration of that prototype; without it, the scope of "moving over" existing behavior is unknown.
- **Related:** G-01, R-03
- **Options:**
  - A) I will add it to the repo (please say the path)
  - B) It is available at a link (please give it)
  - C) It is not available; build from the plan only
- **Answer (original):** C
- **Answer (English):** C) Not available; build from the plan only
- **Status:** confirmed
- **BA note:** Migration wording removed; closes G-01, R-03.

### Q-04: GitHub Pages hosting
- **Question:** Will this repository be public (or on a plan that supports GitHub Pages), so the game can be deployed to GitHub Pages and shared by link?
- **Why it matters:** The deploy ticket and the "send a link to friends" goal depend on it.
- **Related:** G-02, A-03, NFR-08
- **Options:**
  - A) Yes, the repo is or will be public
  - B) Private repo with a plan that supports Pages
  - C) Other hosting (please describe)
- **Answer (original):** Tôi chỉ muốn chạy ở local
- **Answer (English):** I only want to run it locally (no hosting/deploy)
- **Status:** confirmed
- **BA note:** Overrides the plan's GitHub Pages goal: NFR-08 rewritten, T-004 out, CI stays. Follow-ups Q-09 (playtest with friends) and Q-10 (4G load target).

### Q-05: Setup, performance, balance, README and playtest work
- **Question:** The plan has work with no player-visible feature: repo setup, CI and deploy (T-001 to T-005), performance (T-701), game balance (T-702), content review (T-703), README (T-704) and a playtest with 5 people (T-705). Should each of these be tracked on the board, and who does the playtest?
- **Why it matters:** Decides whether these become stories or tasks of their own, and whether a human activity (playtest) is on the board.
- **Related:** AMB-03, G-04
- **Options:**
  - A) Track all of them on the board; the playtest is done by me with friends
  - B) Track the technical ones (setup, CI, deploy, performance, balance, review, README) but not the playtest
  - C) Other (please describe)
- **Answer (original):** A
- **Answer (English):** A) Track all of them on the board; the playtest is done by me with friends
- **Status:** confirmed
- **BA note:** NFR-14. The deploy part of the question (T-004) is superseded by Q-04.

### Q-06: Supported browsers
- **Question:** Besides current Chrome on desktop, must the game also work in Firefox, Edge or Safari for the MVP?
- **Why it matters:** Extra browsers add testing and possible rendering/pointer-lock fixes; affects acceptance criteria.
- **Related:** AMB-04, NFR-07, FR-13
- **Options:**
  - A) Chrome only (others best effort)
  - B) Chrome and Edge
  - C) Chrome, Edge, Firefox and Safari
  - D) Other (please describe)
- **Answer (original):** A
- **Answer (English):** A) Chrome only (others best effort)
- **Status:** confirmed
- **BA note:** NFR-07.

### Q-07: Language of in-game text
- **Question:** Which language should the text inside the game (menus, HUD, announcements, end-screen lines) use?
- **Why it matters:** Affects every UI acceptance criterion and the end-screen lines; adding a second language later is extra work.
- **Related:** G-05, A-06, FR-40, FR-41, FR-45
- **Options:**
  - A) Vietnamese only
  - B) English only
  - C) Vietnamese with English later (not in MVP)
  - D) Other (please describe)
- **Answer (original):** A
- **Answer (English):** A) Vietnamese only
- **Status:** confirmed
- **BA note:** NFR-15.

### Q-08: Plan's milestone and label scheme
- **Question:** The plan suggests GitHub milestones M0 to M7 and its own labels (area:*, size:S/M/L). Should the board use the milestones M0 to M7 as written, with the squad's own labels and sizes?
- **Why it matters:** Decides how work is grouped and filtered on GitHub; low impact on scope.
- **Related:** AMB-05
- **Options:**
  - A) Yes, use milestones M0 to M7; squad labels and sizes
  - B) Ignore the plan's scheme; group only by epic and story
  - C) Other (please describe)
- **Answer (original):** A
- **Answer (English):** A) Yes, use milestones M0 to M7; squad labels and sizes
- **Status:** confirmed
- **BA note:** Applied as NFR-17; resolves AMB-05.

### Q-09: How friends play during the playtest
- **Question:** Since the game only runs locally, how will your friends play it during the playtest with 5 people?
- **Why it matters:** The playtest story (T-705) and the README (T-704) must describe a way for friends to run the game; this decides what "done" means for them.
- **Related:** G-06, NFR-08, NFR-14
- **Options:**
  - A) Friends play on my computer, one at a time
  - B) Friends run it on their own computers by following README steps (install and start commands)
  - C) I give friends a ready-built folder to open on their own computers
  - D) Other (please describe)
- **Answer (original):** Tôi sẽ deploy lên web để bạn bè chơi sau
- **Answer (English):** I will deploy it to the web later so friends can play (note: differs from the options; relates to the Q-04 local-only answer)
- **Status:** confirmed
- **BA note:** No option picked, but it does say how friends will play: through a web-hosted version that the stakeholder deploys "later". Whether that deploy is part of this backlog (Pages deploy back in?) or done by the stakeholder outside it is unclear and in tension with Q-04, so the deploy scope is asked in follow-up Q-11. Until answered, NFR-08 (no deploy in the backlog) stands.

### Q-10: First-load time target without hosting
- **Question:** The plan wants the game to load in under 3 seconds on a 4G connection (bundle under 1 MB gzip). Since the game now runs only locally, should we drop the 3-second 4G target and keep only the 1 MB size limit?
- **Why it matters:** The 4G load target cannot be tested without a hosted version; keeping it adds an untestable acceptance criterion.
- **Related:** NFR-02, A-08
- **Options:**
  - A) Drop the 4G / 3 s target, keep the 1 MB gzip limit
  - B) Drop both (no load-time or size target)
  - C) Keep both as written
  - D) Other (please describe)
- **Answer (original):** A
- **Answer (English):** A) Drop the 4G / 3 s target, keep the 1 MB gzip limit
- **Status:** confirmed
- **BA note:** NFR-02 reduced to the 1 MB gzip bundle limit; closes A-08. Q-11 may bring hosting back, but the 4G target stays dropped.

### Q-11: Deploying the game to the web
- **Question:** You said you will deploy the game to the web later so friends can play, but earlier you said you only want to run it locally. Should deploying to the web (for example GitHub Pages, automatically when work is merged) be part of the work on this board?
- **Why it matters:** Decides whether the plan's deploy ticket (T-004), a public link and Pages-related acceptance criteria are in scope, or whether you deploy it yourself outside the board.
- **Related:** C-03, G-06, NFR-08, NFR-14
- **Options:**
  - A) No. The board covers local run and CI only; I will deploy it myself later, outside the board
  - B) Yes. Add the GitHub Pages deploy (plan T-004) to the board, so merged work is published automatically
  - C) Other (please describe)
- **Answer (original):** A
- **Answer (English):** A) No. The board covers local run and CI only; I will deploy it myself later, outside the board.
- **Status:** confirmed
- **BA note:** Applied: NFR-08 final (board = local run + CI; no deploy ticket; stakeholder deploys later outside the board). Resolves AMB-06, C-03, G-06, A-09.
