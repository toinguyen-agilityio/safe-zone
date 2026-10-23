# S-02: Lint, formatting and unit tests run locally

- **Priority:** P0 (milestone M0 Setup)
- **Covers:** NFR-05, NFR-12 · **Decisions:** NFR-12
- **Depends on stories:** S-01

## User story
As a developer, I want lint, formatting and a unit test runner ready, so that pure game logic can be tested from the start.

## Acceptance criteria
1. **Lint command**
   - Given the project from S-01
   - When I run `npm run lint`
   - Then ESLint and Prettier checks run and finish without errors on the current code
2. **Test command**
   - Given the project
   - When I run `npm test`
   - Then Vitest runs and at least one sample test passes
3. **Failing test is visible**
   - Given a deliberately broken test
   - When I run `npm test`
   - Then the command exits with an error and names the failing test

## Out of scope
- Running these in CI (S-03).

## Notes
- Pure logic (collision, zone, damage, line of sight) must have unit tests in later stories (NFR-05).
