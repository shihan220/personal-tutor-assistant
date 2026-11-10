# Tutorly frontend

React + TypeScript + Tailwind CSS, built with Vite. This phase contains only the browser application. Flask is the agreed future backend; no Flask application, database, API, server authentication or external messaging is implemented.

The original `PROJECT_PLAN.md`, `ACCEPTANCE_TESTS.md`, and proposal PDF stay separate in the workspace root. They are planning material, not application source.

## Run locally

Use Node 24.15 or newer on the Node 24 line, Node 22.22.2+, or Node 26+. The bundled development runtime used for verification is Node 24.22.1.

```sh
cd frontend
npm ci
npm run dev
```

Open the Local URL printed by Vite, normally `http://localhost:5173`. For a production build, run `npm run build`. `npm run preview` serves that static build locally. `npm test` runs the frontend regression suite.

## Explore

The app opens on the tutor overview. Use the **Preview role** selector to explore the student, tutor, officer and administrator experiences. The selected preview role and fictional records persist in browser storage. Settings -> Reset sample data restores the sample records. Settings -> View sign-in design opens `/login`; any preview password works and nothing is authenticated or transmitted.

The sample clock is 3 November 2026 at 08:00 London time, so screenshots and upcoming/past views are reproducible. All sample identities use `example.edu` addresses. The provisional Tutorly name, logo, fonts and colour system can be changed centrally.

| Area             | Interactive frontend coverage                                                                                                                                        |
| ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Overview         | Role-specific statistics, meeting details, follow-ups, student profiles and shared notebook.                                                                         |
| Meetings         | Upcoming/history/request tabs; searchable list; navigable monthly calendar; schedule, edit/reschedule and cancel dialogs; client-side collision feedback.            |
| Requests         | Student meeting/change/correction requests; tutor scheduling review; officer attendance-correction review; pending/accepted/declined states.                         |
| People           | Search, course filter, student profile; administrator account creation/editing, staff view, activation and tutor assignments.                                        |
| Attendance       | Scoped overview, fractions/percentages, outcome filter, records, correction requests and CSV export.                                                                 |
| Notes            | Search/filter, create, author editing, revision count and other-author read-only state; visible sharing explanation.                                                 |
| Follow-ups       | Board/list, search, resolved filter, officer ownership/due dates/actions, internal narrative, separate released student summaries and resolution validation.         |
| Notifications    | Role-specific list, unread filter, mark as read and navigation to the associated area.                                                                               |
| Settings         | Profile, notification preferences, sample-data reset; officer rule-impact preview; administrator activity log/export.                                                |
| Account screens  | Sign-in layout, preview role entry, password visibility and recovery confirmation design.                                                                            |
| Shared behaviour | Responsive sidebar, mobile menu, global search (Cmd/Ctrl+K), focus-managed dialogs, keyboard focus, empty states, toasts, error recovery and unknown-route handling. |

## Source structure

```text
src/
  components/       Shared UI, application shell and tables
  context/          Workspace state and dialog orchestration
  data/             Fictional sample fixtures and preview clock
  features/         Meeting, note, people and concern forms in separate folders
  lib/              Display, filtering, calendar and export helpers
  pages/            Route-level role screens
  services/         Browser-only mock repository (future integration boundary)
  test/             Frontend behaviour regression tests
  types/            Shared TypeScript view models
  index.css         Tailwind import, theme tokens and shared components
```

## Boundary for the later Flask phase

`services/mockRepository.ts` currently loads and saves one versioned browser snapshot. It has no network requests. Context calls and TypeScript view models keep UI state separate from visual components. Once API requirements are supplied, add an API repository and map API responses into these view models; retain the screen, form and component interfaces where practical. No endpoint paths or database schema are being committed in this phase.

All role filtering, validation, attendance calculations and case changes here are mock UI behaviour. They are not access-control enforcement, university policy, authoritative attendance calculation, background processing, actual email delivery or an auditable server record. A preview role selector is intentionally available. Do not put real student records or credentials in the preview.

Mock limits: rule changes affect visible attendance indicators but do not generate cases automatically; deadlines are displayed but no scheduler runs; note edits show revision counts rather than immutable revision storage; meeting changes and corrections update local sample records. Genuine notification delivery, authentication/SSO, authorisation, complete workflow enforcement and durable history belong to the later backend phase.

## Stability checks

Run `npm run build` and `npm test`. The tests cover role views, scheduling conflict handling, student requests, shared notes and editing, follow-up resolution, account reassignment, recovery-screen states and corrupt storage fallback. Browser QA also checks representative desktop/mobile layouts and the real forms. The root acceptance specification remains the broader application plan; it is not a claim of backend test completion.

## Saved design previews

- [Tutor overview](docs/previews/tutor-overview.png)
- [Mobile meetings](docs/previews/mobile-meetings.png)
- [Sign-in design](docs/previews/sign-in.png)

Verified: production build and 12 frontend tests pass. Browser checks covered a 1440px desktop and 390px mobile viewport, schedule creation, student request submission, officer follow-up changes, global search, sample reset, and the sign-in layout. Mobile meeting-page content fits its viewport without horizontal page overflow.
