# Personal Tutor Assistant: team project plan

Version 0.1 | Prepared 3 November 2026 | Status: proposed implementation baseline

This plan turns the project pitch and review into work the team can implement and demonstrate. It proposes a six-week delivery sequence; the actual deadline, available hours, final roster, and stakeholder decisions remain to be confirmed. Numerical thresholds and response times below are prototype defaults, not university policy.

The companion `ACCEPTANCE_TESTS.md` defines the test data, expected outcomes, and release checks. Tests are specifications awaiting implementation; no application has been built or tested as part of this planning work.

## 1. Purpose and success criteria

Help students and personal tutors organise individual meetings, maintain an accurate shared record, and ensure attendance concerns receive a documented response.

The main demonstration follows one student through: tutor assignment -> meeting request and scheduling -> attendance confirmation -> shared notes -> attendance flag -> officer review -> follow-up -> resolution.

Success means:

- Each role can complete its tasks and cannot retrieve another person's unauthorised records.
- Every displayed attendance figure can be traced to dated meeting outcomes and the applicable rule version.
- Every concern has an active responsible officer, a deadline, and a recorded outcome.
- Corrections, cancellations, tutor changes, and delivery failures produce predictable results.
- A new team member can set up the application and run its tests from the README.

## 2. Scope

### First release: must deliver

| Work area | Included behaviour |
|---|---|
| Accounts and assignments | Provision synthetic accounts; four roles; cohort scopes; assign and replace tutors; deactivate accounts. |
| Meetings | Student requests; tutor creates individual appointments; accept/decline rescheduling requests; cancel; record in-person or online location; calendar and accessible list views. |
| Attendance | Tutor confirms meeting outcome and attendance; students view their records and request corrections; officers review and correct records within scope. |
| Notes | Students and their current tutor create shared plain-text notes; authors amend their own notes with revision history and visible authorship. |
| Oversight | Tutor sees current tutees; officer sees assigned cohorts; report clearly labelled as tutor-meeting attendance. |
| Concerns | Percentage and consecutive-absence rules; manual academic/attendance concerns; review, ownership, follow-up, escalation, closure. |
| Notifications | In-app notifications; email adapter demonstrated through a mail sandbox; reminders, cancellations, and staff-approved support messages. |
| Trust and quality | Permission checks, audit history, meaningful automated tests, accessibility checks, migrations, and a backup/restore demonstration. |

Use synthetic data for development, surveys, demonstrations, screenshots, and shared test environments. A production rollout with real student data is a separate decision, with the institutional requirements in section 10 resolved first.

### Deferred features

Group tutorials, one-time check-in codes, file attachments, rich-text notes, calendar synchronisation, native mobile apps, lecture attendance imports, university SSO integration, and institutional production operation. Keep the data model capable of multiple meeting participants, but implement individual meetings first.

The application does not perform disciplinary, withdrawal, visa, clinical, or safeguarding decisions. Urgent welfare issues follow existing university procedures; an ordinary app task is not an emergency response service.

The September 2026 Portsmouth attendance policy describes existing attendance systems and an Engagement Dashboard. Validate the particular tutoring workflow gap in interviews rather than assuming the university lacks attendance software. [University attendance policy, section 3.2](https://policies.docstore.port.ac.uk/policy-075.pdf)

## 3. Who can access what

The four roles are Student, Personal Tutor (PT), Student Officer, and Account Administrator. “Student Officer” is the prototype role name; confirm its correspondence to actual staff responsibilities, including Student Success Advisers. A lead officer is an officer designated as a backup/escalation contact for a cohort, with the same data boundaries.

“Current tutee” means an active, dated tutor assignment. “Within scope” means an explicitly assigned cohort; an officer has no institution-wide access by default. A role alone never establishes permission to an individual record.

| Record or action | Student | Personal Tutor | Student Officer | Account Administrator |
|---|---|---|---|---|
| Basic identity and contact details | Own record | Current tutees | Students within scope | Minimum fields needed for account/assignment administration |
| Meeting schedule | Own meetings; submit requests | Create/change meetings for current tutees | View within scope | No meeting content |
| Attendance and correction requests | Read own; request correction | Record/correct current tutees | Read/correct within scope | No attendance content |
| Shared meeting notes and revisions | Read own; create/amend own contributions | Read current tutees; create/amend own contributions | No access | No access |
| Concern summary and status | Only separately released support summary | Current tutee's concern summary/status; raise concern | Full concern within scope | No concern content |
| Officer follow-up notes and internal actions | No direct access | No direct access | Within scope | No access |
| Student-facing support message | Own released message | Current tutee's released message | Draft/release within scope | No access |
| Attendance rules | Read explanation of applicable rules | Read applicable rules | Manage versions within scope | No rule changes |
| Roles, scopes, tutor assignment | View own assignment | View own assignments | View within scope; request changes | Manage, subject to AC-08 |
| Audit history | Own note revisions and correction outcomes | Relevant operational history for current tutees, excluding officer-only content | Relevant operational history within scope, excluding shared note bodies | Account/security metadata only |

AC-01. Enforce the matrix on every server request, including reads, updates, searches, list counts, calendar feeds, and background-job recipients. Deny unlisted permissions. The client cannot supply a trusted role or owner identifier.

AC-02. Officer scope is checked against the student's cohort membership; changing filters or object identifiers cannot expand it. Cohort transfers end old-officer access and reroute open cases to a valid new officer, with audit history retained.

AC-03. Only a note's author can amend its text while they still have access to the student. Edits create revisions. Other participants may add a separate contribution. No user-facing hard deletion of completed meeting evidence or notes in the MVP; privacy requests use the controlled process in section 10.

AC-04. When a tutor changes, the former tutor loses application access immediately, including through an existing login. Proposed continuity rule: the new tutor can read the student's shared meeting-note history. The note composer must say that the student and their current tutor, including a replacement tutor, can read it. Officer-only case notes remain restricted. Confirm this default before real-data use.

AC-05. Being an account administrator does not grant application access to notes, attendance, or cases. Audit screens must not expose confidential bodies or revision text to administrators.

AC-06. Only officers within scope manage officer-only case notes or release student-facing case messages. A tutor's case summary contains the category, current status, owner contact, and any released support plan; it excludes internal narrative. Students see no restricted case details or counts in page data or APIs. This UI rule does not determine legal subject-access rights.

AC-07. Disabled accounts cannot make further authenticated requests or receive queued notifications. Recheck privileges against current server-side records, rather than trusting stale session claims. Logout invalidates the current session; stored sessions support revocation.

AC-08. Users cannot grant themselves roles, cohort scope, or tutor assignments. Bootstrap administrators through a controlled setup command. Subsequent self-affecting privilege changes require another administrator; all grants and assignment changes are audited. Blocking a deactivation until responsibilities are reassigned is acceptable; emergency deactivation must atomically route open work to the lead officer.

These rules apply least privilege and per-request authorisation as described by [OWASP](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html).

## 4. Meeting rules

MT-01. A student submits a meeting request; the current tutor accepts a slot or proposes another. Validate start < end and an active assignment. Use half-open intervals [start, end), allowing back-to-back meetings. An overlapping active appointment for either participant must be rejected even when two requests arrive simultaneously. Conflict checking covers this application's appointments; external calendar integration is deferred.

MT-02. Before its start, a meeting may become `cancelled` or `superseded` by a linked replacement. Those records are retained. After its start, rescheduling creates a new appointment and preserves the original outcome. A retrospective correction that removes an absence from eligibility requires an officer's recorded approval and reason; it cannot be disguised as a normal cancellation.

MT-03. Meeting outcomes are `scheduled`, `held`, `cancelled`, `superseded`, or `tutor_unavailable`. Here, `held` means the tutor was present and made the session available, including when the student did not attend; student attendance is recorded separately. Time passing never automatically proves that a meeting was held or a student was absent. An overdue scheduled meeting creates a missing-record task. A tutor-unavailable outcome requires a reason and an offer of a replacement.

MT-04. Store timestamps in UTC; display the named zone Europe/London and offset where useful. Reject nonexistent local times and require an explicit offset for ambiguous daylight-saving times. Reminder calculations use the stored instant.

MT-05. Students may request a reschedule, cancellation, or attendance correction, with a short reason. Requests do not themselves change attendance. The tutor reviews scheduling requests; an officer reviews attendance disputes. Record accepted/declined status, reviewer, time, and explanation. Pending disputes mark the relevant absence as disputed and pause new attendance-flag generation that relies on that record until reviewed; already open cases receive a review-needed marker.

## 5. Attendance rules

All defaults in this section need stakeholder confirmation in decision D-03.

AT-01. Report personal-tutor meeting attendance only. Each cohort has an explicit teaching-block date range. Use required meetings whose start falls within both the student's active enrolment interval and the block, and whose end has passed. Optional meetings, future meetings, cancelled/superseded appointments, and tutor-unavailable outcomes are excluded. Retain excluded records for explanation and audit.

AT-02. A held meeting has one attendance record per student: `present`, `late`, `absent`, `excused`, or `unrecorded`. Only the tutor or scoped officer can confirm/change it. `Late` counts as attended for the prototype; record actual lateness separately if needed. An officer approves an `excused` outcome; do not require medical details in the reason.

AT-03. Calculate from confirmed eligible outcomes:

```text
attended = present + late
denominator = present + late + absent
attendance_percent = 100 * attended / denominator
```

Excused and unrecorded outcomes are excluded from the denominator. If the denominator is zero, display “No confirmed attendance data”, never 0% or 100%. Display attended/denominator plus excluded and unknown counts. An overdue `scheduled` meeting counts as unknown, alongside held meetings with unrecorded attendance. If any eligible outcome is unknown, label the percentage provisional and suppress percentage-based flags until the gap is resolved.

AT-04. Proposed low-attendance trigger: strictly below 60%, with at least three confirmed eligible outcomes and no unknown or unresolved disputed outcomes. Compare the unrounded value; round only for display. Exactly 60% does not trigger. This is a configurable demonstration threshold, not an asserted university requirement.

AT-05. Independently trigger on two confirmed consecutive unexcused absences in the block. Order by meeting start, then stable meeting ID. Present/late resets the run. Excused, optional, cancelled, superseded, and tutor-unavailable meetings are skipped. An unknown or disputed eligible outcome breaks the provable run: do not infer a consecutive absence across it. A verified pair elsewhere can still trigger. This rule does not need three outcomes.

AT-06. Missing records are staff data-quality tasks, not student absence concerns. After one working day past meeting end, notify the responsible current tutor; after two working days, show it to the cohort's lead officer. Separately identify active students with no qualifying meeting offered by a configurable block deadline, initially block-start + 10 calendar days. An offer counts only if it is a required scheduled or held meeting in the block; cancelled/superseded/tutor-unavailable meetings do not count. These scheduling tasks never reduce student attendance.

AT-07. Approved corrections require an actor, timestamp, short reason, and old/new values. Recalculate reports and flags after commit. Preserve previous evidence and rule snapshots. If a correction removes the trigger, automatically close only an unreviewed system-generated case; a reviewed case is marked for officer reassessment. An unresolved dispute follows MT-05.

AT-08. Store a versioned rule set per cohort and block: threshold, minimum sample, consecutive limit, missing-record deadlines, and meeting-offer deadline. Officers normally change the next block's rules. Applying a new version to the current block requires a preview of affected students and explicit confirmation; record actor/reason and recalculate. Existing cases retain their original rule/evidence snapshot. No change sends student emails automatically.

AT-09. Evaluate on relevant committed changes and through an hourly reconciliation job, so time-based tasks appear without page visits. De-duplicate system work by student, block, and concern/task category. Repeated runs with unchanged evidence must not generate new cases or alerts. Two rules firing together produce one attendance case with both reasons.

Worked examples, with all meetings in the same block and eligible unless stated:

| Outcomes | Expected result |
|---|---|
| Present, late, absent, cancelled | 2/3 = 66.7%; cancelled excluded; no trigger. |
| Absent, present, absent | 1/3 = 33.3%; percentage trigger; no consecutive pair. |
| Present, absent, present, absent, present | 3/5 = 60%; no trigger. |
| Absent, absent | 0/2 = 0%; consecutive trigger; percentage sample too small. |
| Present, present, absent, unrecorded | Provisional 2/3 = 66.7%, one unknown; no percentage trigger. |
| Absent, unrecorded, absent | Provisional 0/2 = 0%; unknown breaks the consecutive run; no attendance flag. |
| Excused, cancelled, tutor unavailable | No confirmed attendance data; exclusions shown; no student flag. |

## 6. Concern and follow-up rules

FU-01. System attendance flags create an `awaiting_review` case. Tutors may raise a manual attendance/academic concern for a current tutee; officers may raise one within scope. Each case includes student, category, source, minimal factual summary, evidence/rule snapshot, and one active responsible officer. Route to the cohort's designated officer, with a configured lead officer fallback. Invalid routing must surface as an operational error to the lead officer; never silently drop work. Do not put private meeting-note bodies into cases automatically.

FU-02. Proposed states: `awaiting_review -> in_progress -> resolved`. An active case can be marked `escalated`, with the lead officer as owner, and return to `in_progress` after acknowledgement. Resolve with an outcome and reason, including support completed, evidence corrected, duplicate, or no action needed. The officer may set a waiting-for-student next action, but remains responsible.

FU-03. Proposed deadlines: review/acknowledge within two working days of creation and record a next action due within five working days of acknowledgement. Working days in the prototype mean Monday-Friday in Europe/London; due times are 17:00 local. Count from the next working day. Public-holiday handling requires confirmation before real service use. Persist UTC deadlines and test them with a controlled clock.

FU-04. Notify the owner in-app when a case is created. An officer first checks attendance accuracy, authorised absences, and applicable adjustments before releasing a supportive student message or action plan. Use a separate student-visible summary; do not copy internal notes. Any tutor email copy follows current assignment and contains only the released content. No automatic sanctions or external reporting.

FU-05. If review or a next action is overdue, escalate to the lead officer on the next hourly evaluation. Repeated scans send one escalation per case/deadline version. If the lead officer already owns it, create one prominent overdue alert to that officer instead of an ownership loop. Reassignment records the reason, retains the existing deadline, and notifies the new owner. Pausing or extending a deadline requires an officer's explicit reason and a new deadline version.

FU-06. Allow at most one open attendance case per student/block. Add new evidence to it. After resolution, unchanged evidence cannot recreate it; a new unexcused absence or an explicitly applied new rule version may create one linked successor if a trigger now holds. Corrections to existing outcomes follow AT-07 rather than masquerading as new events. Manual concerns remain separate and require deliberate creation.

FU-07. Store intended in-app/email notifications durably after the business transaction, with unique event/recipient/channel keys. Before sending, recheck account status, assignment, scope, and whether the message is still applicable. Use generic subjects and authenticated app links; case email contains only the released support summary. Retry transient email failures at most three times after the initial attempt, then mark failed and expose it to staff. Never label provider acceptance as proof of reading. Use provider idempotency where supported; otherwise flag uncertain delivery for review because a crash after provider acceptance can cause a duplicate. In-app messages remain available during email failures.

FU-08. Resolution requires an outcome and recorded handling of all outstanding actions; sending an email alone cannot resolve a case. Officer-only narrative is not included in student dashboards or shared tutor notes. Urgent welfare concerns are directed to existing university procedures immediately, rather than waiting for these prototype deadlines.

## 7. Application and data structure

Use one Flask application, HTML/Jinja templates, CSS, and modest JavaScript. PostgreSQL is the proposed shared development/test database; use the same engine for integration tests, especially scheduling conflicts. SQLite can support a disposable local experiment, but is not evidence that PostgreSQL concurrency rules work.

Use an application factory, feature Blueprints, shared permission functions, and service functions for workflow calculations. The [Flask application-factory pattern](https://flask.palletsprojects.com/en/stable/patterns/appfactories/) supports isolated test configurations.

```text
app/
  __init__.py           # create_app and configuration
  auth/                # Sessions, role and record permission checks
  users/               # Accounts, cohorts and tutor assignments
  meetings/            # Requests, scheduling and attendance
  notes/               # Shared note contributions and revisions
  concerns/            # Rules, cases, actions and officer workflow
  notifications/       # Durable delivery records and mail adapter
  jobs/                # Hourly evaluation and delivery worker
  models/              # Shared database models
  templates/
  static/
migrations/
tests/
docs/
```

Core entities: users and revocable sessions; role/scope grants; cohorts, teaching blocks and enrolments; dated tutor assignments; meetings and participants; student requests; attendance and revisions; shared notes and revisions; versioned rule sets; concerns, evidence and actions; notification outbox/deliveries; audit events.

Database safeguards include foreign keys, one participant-attendance row per meeting/student, one current tutor assignment per student, one open attendance case per student/block, and transactional booking conflict protection. Save the case and its notification intent together. Workers use safe claiming and idempotency keys. Use a single scheduled worker initially; concurrency safety still belongs in the database.

## 8. Team ownership and delivery sequence

The following allocations are suggestions based on the pitch's named team members. Confirm them at kickoff; every feature owner writes tests and documentation, with another member reviewing the work. Keep Gary as the initial coordinating lead, then rotate coordination as proposed in the pitch. A sixth member is unconfirmed and is not required for the baseline schedule.

| Suggested owner | Workstream | Suggested reviewer |
|---|---|---|
| Gary | Stakeholder questions, scope/decision log, CI setup and release evidence | Shihan |
| Shihan | Application setup, identity/permissions, schema integration and deployment configuration | Gary |
| Smayan | Meeting requests, scheduling, calendar/list UI and time handling | Jake |
| Jake | Attendance, corrections, rule calculations and reports | MJ |
| MJ | Shared notes, concern workflow, notification adapter and job integration | Smayan |
| Sixth member, if confirmed | Pair on notification jobs and accessibility checks to reduce MJ's workload | MJ |

All five named members contribute to fixtures, permission tests, interface review, and documentation. Shihan pairs on jobs/schema integration; Gary pairs on notifications and release checks. A reviewer is independent of the author, but neither security nor testing belongs to one person alone.

| Relative week | Deliverable and dependency | Completion evidence |
|---|---|---|
| 1 | Interview tutor, students, officer and account/assignment owner; confirm terminology, scope and draft rules; agree schema and UI sketches | Decision log D-01 to D-06; prioritised GitHub backlog; test fixtures agreed |
| 2 | Application setup, migrations, seeded roles/cohorts, login, permissions and CI | Permission tests pass; fresh setup works; all four role screens reachable |
| 3 | Assignment -> request -> meeting -> attendance -> shared note workflow | Integrated student/tutor demonstration; booking, note and attendance tests pass |
| 4 | Officer rules, flags, concern ownership, follow-up, jobs and mail sandbox | Complete end-to-end case including correction and escalation; deduplication tests pass |
| 5 | Cross-role/security tests, concurrency, accessibility, backup/restore and stakeholder walkthrough | Defect list with severity, UAT evidence and corrected critical/high defects |
| 6 | Reserved for integration fixes, regression checks, documentation and assessment rehearsal | Release checklist, test report, setup/runbook and reproducible demo |

Re-estimate after week 1 against actual available hours and deadline. Keep roughly the final 20% of available effort for integration and fixes. If capacity is smaller, simplify calendar presentation and email-provider integration first; retain permissions, correct attendance, case ownership and tests. Do not add deferred features while core acceptance tests remain incomplete.

Create GitHub issues by deliverable, with owner, reviewer, rule IDs, acceptance-test IDs, dependency, and small demo. Examples: “Enforce AC-01/02 for meeting endpoints”, “Implement AT-03/05 calculation”, “Implement FU-05 overdue escalation”. Use feature branches and reviewed pull requests; review and demonstrate progress weekly. No GitHub issues or external messages are created by this document.

## 9. Testing and definition of done

Implement the companion acceptance specification as feature work lands. Use pytest for pure calculations and request/database integration; use a small browser suite for the main role workflows. Control time and mail delivery through injectable adapters. Run database integration and concurrency checks against PostgreSQL. Test endpoint permissions directly even when a UI button is hidden.

Every pull request needs matching positive/negative tests for its rules, a migration if schema changes, an independent review, and a brief demonstration. CI runs automated tests and linting, with no real email recipients or student records. Keep manual accessibility and stakeholder results as evidence alongside automated output.

Release criteria:

- All planned automated cases in `ACCEPTANCE_TESTS.md` pass against the release commit; manual checks have recorded outcomes.
- No unresolved critical/high defects involving access, record accuracy, ownership or data loss.
- Account/tutor/scope changes take effect on the next request and notification send.
- A clean database migrates, demo data seeds, and a backup restores successfully.
- A tutor, a student and an officer can complete their core workflow with synthetic records; findings are logged and dispositioned.
- README, role rules, decision log, test results, and support/restore instructions are complete. If stakeholders are unavailable, label internal UAT as provisional rather than claiming stakeholder validation.

## 10. Security, privacy and operation requirements

OP-01. Prototype login uses provisioned synthetic accounts, password hashing through a maintained authentication library, server-side revocable sessions, CSRF protection on state-changing requests, request-size limits, and rate limiting for login. No public role selection or self-registration. Apply HTTPS, Secure/HttpOnly/SameSite cookies, a 30-minute idle timeout and eight-hour maximum session duration in deployed configuration; use a production server with debug disabled.

OP-02. Store notes as plain text, escape output, allow only approved URL schemes, and use parameterised database access. Keep secrets out of source control and disable stack traces to users. Flask provides some protections, but CSRF and application-specific output handling require deliberate configuration. [Flask security guidance](https://flask.palletsprojects.com/en/stable/web-security/)

OP-03. Audit sensitive changes with actor, time, target, action and an appropriate reason. Protect business history from ordinary user modification. Keep confidential narrative, credentials and tokens out of routine logs and emails. Note revisions remain in their permission-protected store, not in broadly visible operational audit records. Track job failures and database errors through staff-visible operational status.

OP-04. Support keyboard operation, visible focus, labelled inputs, clear errors, readable contrast, non-colour status indicators and a list alternative to the calendar. Test the core flow at a narrow mobile viewport and at 200% zoom, plus a screen-reader check of login, meeting request and attendance explanation.

OP-05. Document configuration, jobs, migrations, backup and restoration. Demonstrate recovery from a daily backup in a fresh environment; aim for no more than 24 hours of data loss and restoration within four hours in the prototype exercise. Backups need protected access and encryption in storage. Delete synthetic demo records within 30 days after final assessment; document backup expiry too. A real-data retention period must be set by the university, with rights requests and any lawful retention exceptions handled through a controlled process.

OP-06. Before a real-data pilot, confirm institutional ownership, approved hosting and identity integration, administrator/operational access, incident response, retention, privacy notices, lawful basis and any special-category processing condition. Assess the need for a DPIA with the university's data-protection team. App-level administrator restrictions do not eliminate privileged database/hosting access; that access needs separate operational control. Health-related notes may need additional legal safeguards. [ICO special-category guidance](https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/lawful-basis/a-guide-to-lawful-basis/special-category-data)

## 11. Decisions to confirm

The team can build the synthetic prototype using the defaults above. Record interview answers and update the relevant rule, test expectation and decision together. Permission, calculation and real-data decisions need agreement before stakeholder acceptance or real use, even if prototype work proceeds.

| ID | Decision | Proposed default / question | Owner and target |
|---|---|---|---|
| D-01 | Deadline, capacity, roster and allocation | Six relative weeks; five named members; sixth unconfirmed | Gary and team, kickoff |
| D-02 | Institution, user roles and existing workflow gap | Assume Portsmouth; confirm who “Student Officer” represents and whether scope is cohort, school or broader | Gary + tutor/officer, week 1 |
| D-03 | Attendance policy and fairness | Tutor-meeting scope; block window; <60% after 3 outcomes OR 2 consecutive absences; exclusions, late/dispute handling, coverage deadline | Jake + tutor/officer, week 1 |
| D-04 | Review deadlines and escalation | 2/5 working-day defaults; lead officer backup; clarify holidays, availability and urgent referrals | MJ + officer, week 1 |
| D-05 | Notes, continuity and reassignment | Shared with current/replacement tutor; authors amend own notes; officer case narrative restricted; define any policy exceptions | Shihan + students/tutor/privacy contact, week 1 |
| D-06 | MVP boundaries and group tutorials | Individual meetings only; confirm that this meets the assessment brief and pilot need | Gary + module coordinator, week 1 |
| D-07 | Live operation and data governance | Synthetic prototype only until institutional requirements and retention/identity arrangements are agreed | Shihan + university system/privacy owner, before any real-data pilot |

The Portsmouth tutoring policy allows individual and group meetings and sets expectations about meeting frequency. Our individual-meeting prototype and numerical alerts cover a deliberately narrower workflow; interviews must confirm its fit. [Personal Tutoring Policy, operational arrangements](https://policies.docstore.port.ac.uk/policy-298.pdf)

## 12. First team meeting

1. Confirm D-01, nominate feature owners/reviewers, and agree weekly available hours.
2. Walk through the permission matrix and the seven attendance examples; record disagreements as decisions.
3. Agree interview questions for D-02 to D-06 and use synthetic examples in interviews.
4. Sketch the four dashboards around tasks: next meeting, missing record, correction request, or due follow-up.
5. Create the repository, backlog and initial fixtures; schedule the first assignment-to-meeting demonstration.

## Sources and interpretation

The original project pitch is `Personal tutor assistant project.pdf` in this workspace, reviewed in the preceding conversation. Public references were checked on 3 November 2026. The attendance policy served is September 2026; the tutoring policy served is August 2025 and lists a June 2026 review date, so confirm its continuing applicability with the university. This plan's access scopes, thresholds, workflow states, deadlines, team allocations and schedule are proposals; none are represented as approved university policy.
