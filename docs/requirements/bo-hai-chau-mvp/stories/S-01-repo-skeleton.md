# S-01: Project starts and shows a spinning box

- **Priority:** P0 (milestone M0 Setup)
- **Covers:** NFR-12 · **Decisions:** NFR-12 (mandatory stack), Q-03
- **Depends on stories:** none

## User story
As a developer, I want a working project in the repository built with the agreed stack, so that every later feature has a place to live and I can see something run.

## Acceptance criteria
1. **Dev server shows a box**
   - Given dependencies are installed with `npm ci`
   - When I run `npm run dev` and open the printed address in Chrome
   - Then the page shows a 3D box rotating
2. **Agreed stack**
   - Given the repository
   - When I look at the project setup
   - Then it uses Vite + TypeScript and three.js pinned to one fixed version
3. **Folder layout**
   - Given the repository
   - When I look at the source folder
   - Then it follows the structure proposed in plan section 2 (core, world, physics, entities, ai, systems, render, ui, audio, tests)
4. **Production build**
   - Given the project
   - When I run `npm run build`
   - Then a static build is produced without errors

## Out of scope
- Lint, tests and CI (S-02, S-03); hosting or deploy (decided Q-11: outside the board).

## Notes
- The stakeholder fixed the stack in plan section 2; this story does not choose anything else.
- The dev page is the page opened by `npm run dev`; later stories replace the box with the game.
