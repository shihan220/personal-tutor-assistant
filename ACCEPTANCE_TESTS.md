# Personal Tutor Assistant: acceptance test specification

Version 0.1 | Prepared 3 November 2026 | Companion to `PROJECT_PLAN.md`

Status: planned tests, not executed application tests. Implement these cases as the application is built. Requirement IDs refer to the project plan. Each row can produce multiple parameterised tests; a passing UI demonstration alone is not proof that endpoint permissions work.

## 1. Fixtures and execution conventions

Use synthetic identities only:

- Students S1 and S2 in cohort A; student S3 in cohort B.
- Tutor T1 currently assigned to S1; T2 assigned to S2/S3. Reassign S1 to T2 in transfer tests.
- Officer O1 and lead officer L1 scoped to A; O2 and L2 scoped to B.
- Administrators A1/A2, plus disabled versions of each role where relevant.
- A fixed teaching block, enrolment intervals, a versioned rule set and a controllable UTC clock with Europe/London display.
- A mail sandbox with success, transient failure, permanent failure and uncertain-acceptance modes. No real outgoing messages.

Reset the database between independent tests. Use the deployment database engine for integration/concurrency tests. Collect responses, persisted records, audit events and notification intents; assert all four when relevant. For an unauthorised object, return a consistent non-disclosing response and no protected fields. An unauthenticated request may redirect to login or receive 401; document the chosen convention.

Use these levels: U = pure unit calculation; I = request/database/job integration; B = browser workflow; M = documented manual exercise. The owner is the proposed feature owner from the plan; the named reviewer verifies the evidence independently.

## 2. Access and privacy tests

| Test | Requirements | Given / action | Expected result | Level / owner |
|---|---|---|---|---|
| T-01 | AC-01, AC-05 | Parameterise every matrix action for each role, including allowed and forbidden record relationships. | Allowed operations work; forbidden ones deny without mutation or protected data. Admin status alone never opens attendance, notes or cases. | I / Shihan |
| T-02 | AC-01 | S1 substitutes S2's student, meeting, note, request and case IDs in URLs and bodies; T1 targets S2. | Every attempt denies. Forging role, author or owner fields does not expand access. | I / Shihan |
| T-03 | AC-01, AC-02 | O1 targets cohort B through direct IDs, filters, search, pagination, list totals and calendar endpoints. | S3's records and identifying counts are absent; direct reads/writes deny. Test allowed access to cohort A as a positive control. | I / Shihan |
| T-04 | AC-03, OP-03 | S1 edits their note; T1 edits S1's note; S1 attempts to delete completed evidence. | Author edit creates a protected revision; other-author edit and ordinary hard deletion deny. No confidential text leaks into general audit logs. | I / MJ |
| T-05 | AC-04, AC-07 | T1 is logged in when S1 is reassigned to T2. | T1's next read/write denies, even for a note T1 authored. T2 can read shared history, but not officer-only narrative. Composer explains replacement-tutor visibility. | I+B / Shihan |
| T-06 | AC-02, AC-08 | Move S1 from A to B with an open case owned by O1. Try transfer with no valid new officer. | Old scope ends immediately; valid transfer reroutes case and preserves audit/deadline. Invalid transfer is blocked or uses configured valid fallback; no unowned case. | I / Shihan |
| T-07 | AC-06 | Populate a case with a distinctive internal marker, then view all student/tutor screens and API responses. | Marker and restricted counts never appear. Released student summary is visible only to S1/current tutor and scoped officers. | I+B / MJ |
| T-08 | AC-07, AC-08, FU-07 | Disable an account with an existing session and queued mail; attempt logout/session replay. | Next request and queued send are blocked; revoked session fails. Open work is reassigned atomically or deactivation is explicitly blocked pending reassignment. | I / Shihan |
| T-09 | AC-08 | Attempt self-role promotion, self-scope expansion and self tutor assignment; then have A2 make an authorised change to A1. | Self-affecting changes deny. Independent authorised change works with actor/time/target recorded. | I / Shihan |

Generate T-01 from the matrix as a maintained fixture so each new endpoint receives both an allowed and denied case. Apply the same rules to any future export or attachment endpoint before releasing it.

## 3. Meeting and attendance tests

| Test | Requirements | Given / action | Expected result | Level / owner |
|---|---|---|---|---|
| T-10 | MT-01, MT-05 | S1 requests a meeting; T1 accepts. Try invalid durations, inactive assignments and an unapproved rescheduling request. | Valid workflow creates one appointment. Invalid inputs deny. Pending requests do not change the confirmed schedule or attendance. | I+B / Smayan |
| T-11 | MT-01 | Send simultaneous overlapping bookings sharing a tutor, then sharing a student; also book back-to-back slots. | One conflicting booking succeeds and the other returns a handled conflict; database has no overlap. Back-to-back bookings both succeed. | I / Smayan |
| T-12 | MT-02 | Reschedule before start; attempt a routine cancellation/reschedule after a recorded absence. | Original pre-start appointment is superseded and linked to replacement. Post-start change cannot erase an absence; exclusion requires approved correction and audit. | I / Smayan |
| T-13 | MT-03, AT-06 | Advance past a scheduled meeting with no confirmed outcome; separately mark tutor unavailable. | Scheduled meeting becomes unknown for reporting, not an automatic absence. Missing-record/replacement tasks are created at the specified deadlines; no student penalty. | I / Smayan |
| T-14 | MT-04 | Use 28 March 2027 at 01:30 Europe/London, then 31 October 2027 at 01:30; test a reminder across each clock change. | Nonexistent spring time is rejected; ambiguous autumn time requires explicit offset. UTC round-trip and reminder instant are correct. | U+I / Smayan |
| T-15 | AT-01, AT-02 | Mix required/optional, future, cancelled, superseded, tutor-unavailable, outside-block and outside-enrolment meetings; attempt excused approval as tutor. | Only eligible held outcomes count. Tutor cannot independently approve excused absence. Officer approval and exclusion are audited. | U+I / Jake |
| T-16 | AT-03, AT-04 | Run the seven worked examples in the plan and boundary values 3/5 and 2/3; add a zero-denominator case. | Exact documented fractions, labels and triggers; exactly 60% does not trigger; zero denominator has no misleading percentage. | U / Jake |
| T-17 | AT-03, AT-04, AT-05 | Eligible outcomes are absent, unrecorded, absent; separately test absent, absent. | First sequence shows provisional 0/2 and no trigger. Second creates one consecutive-absence case even though percentage minimum is unmet. | U+I / Jake |
| T-18 | AT-05 | Parameterise ordered sequences with present, late, excused, optional, cancelled and disputed/unknown outcomes between absences. | Present/late reset; exclusions are skipped; unknown/disputed breaks a provable run. Stable ordering makes results deterministic. | U / Jake |
| T-19 | MT-05, AT-07, FU-06 | Student disputes an absence, then officer accepts or declines with reason. Repeat for unreviewed and reviewed cases. | Dispute pauses flags relying on it. Decision updates evidence, audit and notification. Accepted correction closes an invalid unreviewed system case; reviewed case is marked for reassessment. Decline retains evidence with explanation. | I+B / Jake |
| T-20 | AT-06, AT-09 | Advance to one/two working days after an unknown meeting; then to the configured meeting-offer deadline with no offer, with a cancelled-only offer, and with a valid offer. | Correct tutor/lead tasks appear once; no absence penalty. Cancelled-only offers fail coverage; a qualifying offer satisfies it. Runs need no browser visit. | U+I / Jake |
| T-21 | AT-08, AT-09 | O1 changes next-block rules; then previews and confirms a current-block rule change; O2 attempts the same for A. | Future change leaves current results unchanged. Confirmed current change recalculates once and retains old case snapshots. Wrong-scope change denies. No automatic student email. | I / Jake |

For T-16, compare unrounded values before display rounding. Add a case just below a chosen threshold that rounds to the same displayed percentage, to prove the UI rounding does not decide the trigger.

## 4. Follow-up, time and delivery tests

| Test | Requirements | Given / action | Expected result | Level / owner |
|---|---|---|---|---|
| T-22 | AT-09, FU-01, FU-06 | Both attendance rules fire; replay the event and run two evaluators concurrently; create a manual concern separately. | One open system attendance case with both reasons and one owner; manual case is deliberate and separate. Invalid owner routing uses the lead fallback or surfaces a visible operational error. | I / MJ |
| T-23 | FU-02, FU-03, FU-08 | Create a case at 16:00 London on Friday 6 November 2026; acknowledge it Tuesday 10 November. Try resolving with an outstanding action. | Review due Tuesday 10 November at 17:00; next action due Tuesday 17 November at 17:00. State transitions are valid; incomplete resolution denies. This prototype calendar excludes weekends, not holidays. | U+I / MJ |
| T-24 | FU-04, AC-06 | Case is created, reviewed and a student summary released by O1; T1 and O2 attempt release. | Creation notifies staff only. Authorised release sends the explicit summary to S1 and any approved current-tutor copy; unauthorised release denies; no internal narrative or sanctions. | I+B / MJ |
| T-25 | FU-03, FU-05 | Advance the clock past review and action deadlines; rerun hourly scans; test a lead-owned case and a justified extension. | One escalation per deadline version; no ownership loop. Reassignment preserves deadline; extension records reason/version and obeys new due time. | U+I / MJ |
| T-26 | AT-07, FU-06 | Resolve a case, rerun unchanged evidence, then add a new unexcused absence; separately apply an explicitly confirmed new rule version. | Unchanged evidence creates nothing. A still-triggering new absence or explicit rule version can create one linked successor; simultaneous runs cannot duplicate it. | I / MJ |
| T-27 | FU-07, OP-03 | Fail the case transaction; retry job handling; simulate transient/permanent email failure and worker restart. | Rolled-back cases have no outbox record. Committed intent survives restart. In-app event appears once; up to three retries follow initial email attempt; final failure is visible without losing the case. | I / MJ |
| T-28 | AC-01, AC-07, FU-07 | Reassign tutor, transfer cohort, disable recipient, resolve/correct a trigger, or cancel a meeting before queued mail sends. | Worker rechecks current eligibility/content and suppresses or supersedes stale delivery. Former staff receive no newly sent content; unrelated historical messages are not fabricated as recalled. | I / MJ |
| T-29 | FU-07 | Provider accepts an email but worker crashes before storing the result; simulate provider support and lack of support for idempotency. | Supported idempotency prevents another accepted copy. Otherwise delivery is marked uncertain for review and does not claim guaranteed exactly-once delivery. Provider acceptance is not shown as read. | I / MJ |

## 5. Security, accessibility and recovery tests

| Test | Requirements | Given / action | Expected result | Level / owner |
|---|---|---|---|---|
| T-30 | OP-01, AC-07 | Invalid/absent CSRF token on every state-changing endpoint; repeated bad logins; idle and absolute session expiry; attempt public role selection. | Invalid requests deny without changes, bad-login rate limit activates, sessions expire/revoke correctly, no public role grant exists. | I / Shihan |
| T-31 | OP-02 | Store script-like text in shared notes and concern messages; inject query-shaped input and unsafe URL schemes; send oversized bodies. | Content is safely rendered, protected queries stay scoped, unsafe links deny, size limits respond cleanly, and no secrets/tracebacks are shown. | I+B / Shihan |
| T-32 | OP-01, OP-02, OP-03 | Inspect deployed demo headers/configuration, repository and error paths; simulate job failure. | HTTPS/cookie flags and session settings applied, debug off, secrets absent from tracked files, controlled errors, and job failure visible to responsible staff. | I+M / Shihan |
| T-33 | OP-04 | Complete student request, tutor attendance, and officer follow-up with keyboard; inspect narrow viewport, 200% zoom and screen reader. | No keyboard trap; visible focus/labels/errors; readable content and status; usable list alternative; record and fix barriers. | M / Smayan + Gary |
| T-34 | OP-05, OP-03 | Migrate a clean database; seed synthetic data; restore a protected daily backup into a fresh isolated environment; exercise retention on expired fixtures. | Schema/data integrity and scoped permissions survive restore. Record recovery time and backup age against 4h/24h exercise targets. Retention handles defined fixtures and backup expiry without ordinary-user delete access. | I+M / Gary |
| T-35 | OP-06 | Review proposed live-data pilot with institutional system/privacy owner. | Required ownership, lawful processing, retention, identity, operational access and incident arrangements are recorded. No production-readiness claim based only on synthetic testing. | M / Gary + Shihan |

## 6. User acceptance and evidence

Run one scenario per role with a representative student, tutor, officer, and account/assignment administrator if available. Use synthetic records. Ask each participant to perform tasks without coaching, record completion/blockers and comments, and agree the disposition of findings. Until external stakeholders participate, label an internal team walkthrough as provisional UAT.

The integrated assessment scenario is:

1. A1 assigns S1 to T1; S1 requests a meeting; T1 confirms it.
2. T1 records held meetings and attendance; S1 contributes a shared note.
3. S2 tries S1's record URL and is denied; O1 can view attendance but not the note.
4. Two confirmed absences create one owned case; repeated job runs create no duplicates.
5. O1 reviews evidence, acknowledges, releases a supportive message, and records a due action.
6. S1 disputes an incorrect absence; O1 corrects it; the case requires reassessment and is resolved with a reason.
7. A separate synthetic case becomes overdue; the clock-controlled worker escalates it exactly once for that deadline version.
8. Reassign S1 to T2; verify T1 loses access and any queued T1 copy is suppressed.
9. Demonstrate one failed email, its bounded retry outcome, and a backup restore.

Capture evidence as test ID, release commit, database/configuration, observed result, timestamp, tester/reviewer and linked defect if any. Initial status for every test is **Not run**. Report automated totals separately from manual/UAT checks. Every requirement ID AC-01 to AC-08, MT-01 to MT-05, AT-01 to AT-09, FU-01 to FU-08 and OP-01 to OP-06 must remain linked to at least one test when the plan changes.
