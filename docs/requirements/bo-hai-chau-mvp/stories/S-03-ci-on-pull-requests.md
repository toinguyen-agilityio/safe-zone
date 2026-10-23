# S-03: CI builds and tests every pull request

- **Priority:** P0 (milestone M0 Setup)
- **Covers:** NFR-08, NFR-11 · **Decisions:** Q-04, Q-11 (CI stays, no deploy)
- **Depends on stories:** S-02

## User story
As a developer, I want a pull request to run the build and tests automatically, so that broken code is caught before it merges.

## Acceptance criteria
1. **CI runs on a PR**
   - Given a pull request is opened
   - When the CI workflow runs
   - Then it installs, lints, builds and runs the tests
2. **Red on failure**
   - Given a pull request with a failing test
   - When CI finishes
   - Then the check is red
3. **Green on success**
   - Given a pull request with passing code
   - When CI finishes
   - Then the check is green
4. **No deploy step**
   - Given the CI workflow
   - When I read it
   - Then it contains no hosting or deploy step

## Out of scope
- GitHub Pages deploy (plan T-004) is dropped: the stakeholder deploys later outside the board (Q-04, Q-11).

## Notes
- CI must stay green on `main` for merges (Definition of Done, NFR-11).
