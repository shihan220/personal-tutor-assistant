import { useState } from "react";
import {
  ArrowDownToLine,
  ArrowUpRight,
  CalendarCheck2,
  CheckCheck,
  ClipboardCheck,
  Info,
} from "lucide-react";
import { useWorkspace } from "../context/workspace";
import { useDialogs } from "../context/dialogs";
import {
  attendanceFor,
  downloadCsv,
  fullDate,
  meetingDate,
  visibleMeetings,
  visiblePeople,
} from "../lib/utils";
import { DEMO_NOW } from "../data/seed";
import {
  Avatar,
  Badge,
  Button,
  EmptyState,
  IconButton,
  SearchField,
} from "../components/ui";
import { PageHeading } from "../components/PageHeading";

export function AttendancePage() {
  const { data, role } = useWorkspace();
  const { open } = useDialogs();
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState("overview");
  const [status, setStatus] = useState("all");
  const people = visiblePeople(data, role);
  const ids = new Set(people.map((p) => p.id));
  const filteredPeople = people.filter((p) =>
    p.name.toLowerCase().includes(query.toLowerCase()),
  );
  const meetings = visibleMeetings(data, role)
    .filter(
      (m) =>
        meetingDate(m) < DEMO_NOW &&
        `${m.title} ${data.people.find((p) => p.id === m.studentId)?.name}`
          .toLowerCase()
          .includes(query.toLowerCase()) &&
        (status === "all" || m.attendance === status),
    )
    .sort((a, b) => meetingDate(b).getTime() - meetingDate(a).getTime());
  const requests = data.requests.filter(
    (r) => r.kind === "correction" && ids.has(r.studentId),
  );
  const stats = people.map((p) => attendanceFor(data.meetings, p.id));
  const total = stats.reduce((n, s) => n + s.total, 0);
  const attended = stats.reduce((n, s) => n + s.attended, 0);
  const unknown = stats.reduce((n, s) => n + s.unknown, 0);
  const exportData = () => {
    downloadCsv("tutor-meeting-attendance.csv", [
      [
        "Student",
        "Course",
        "Attended",
        "Confirmed meetings",
        "Attendance percent",
        "Unknown outcomes",
      ],
      ...people.map((p) => {
        const a = attendanceFor(data.meetings, p.id);
        return [
          p.name,
          p.course,
          a.attended,
          a.total,
          a.percent === null ? "" : a.percent.toFixed(1),
          a.unknown,
        ];
      }),
    ]);
  };
  return (
    <div className="animate-enter">
      <PageHeading
        title={
          role === "student"
            ? "Your attendance, with context"
            : "A clearer picture of engagement"
        }
        description="Personal tutor meetings only. A starting point for support, never the whole story."
        action={
          <Button variant="secondary" onClick={exportData}>
            <ArrowDownToLine size={16} />
            Export report
          </Button>
        }
      />
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <div className="stat-card">
          <p className="text-xs text-muted">Confirmed meeting attendance</p>
          <strong className="mt-3 block font-heading text-3xl">
            {total ? `${Math.round((attended / total) * 100)}%` : "—"}
          </strong>
          <p className="mt-2 text-xs text-muted">
            {attended} attended out of {total} confirmed
          </p>
        </div>
        <div className="stat-card">
          <p className="text-xs text-muted">Awaiting a recorded outcome</p>
          <strong className="mt-3 block font-heading text-3xl">
            {unknown}
          </strong>
          <p className="mt-2 text-xs text-muted">
            Missing data never means absent
          </p>
        </div>
        <div className="stat-card">
          <p className="text-xs text-muted">Correction requests</p>
          <strong className="mt-3 block font-heading text-3xl">
            {requests.filter((r) => r.status === "pending").length}
          </strong>
          <p className="mt-2 text-xs text-muted">
            Ready for an officer to review
          </p>
        </div>
      </div>
      <div className="info-box mb-6">
        <Info size={18} className="shrink-0" />
        <p>
          Cancelled, optional, excused, and tutor-unavailable meetings are
          excluded. Future meetings do not affect attendance. A percentage needs
          confirmed outcomes.
        </p>
      </div>
      <section className="panel p-0!">
        <div className="flex flex-wrap gap-6 border-b border-line px-6">
          {[
            ["overview", "Attendance overview"],
            ["records", "Meeting records"],
            ["corrections", "Corrections"],
          ].map(([value, label]) => (
            <button
              key={value}
              onClick={() => setTab(value)}
              className={`nav-tab ${tab === value ? "selected" : ""}`}
            >
              {label}
            </button>
          ))}
        </div>
        {tab !== "corrections" && (
          <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-5">
            <div className="w-full sm:w-72">
              <SearchField
                placeholder="Search attendance records"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            {tab === "records" && (
              <select
                aria-label="Filter attendance status"
                className="input w-full! sm:w-44!"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="all">All outcomes</option>
                {["present", "late", "absent", "excused", "unrecorded"].map(
                  (s) => (
                    <option key={s} value={s}>
                      {s === "unrecorded"
                        ? "Not recorded"
                        : s.charAt(0).toUpperCase() + s.slice(1)}
                    </option>
                  ),
                )}
              </select>
            )}
          </div>
        )}
        {tab === "overview" ? (
          filteredPeople.length ? (
            <div className="table-scroll">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Attended / confirmed</th>
                    <th>Attendance</th>
                    <th>Context</th>
                    <th>
                      <span className="sr-only">View student</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPeople.map((p) => {
                    const a = attendanceFor(data.meetings, p.id);
                    const flag =
                      (a.percent !== null &&
                        a.total >= data.rules.minimum &&
                        !a.unknown &&
                        a.percent < data.rules.threshold) ||
                      a.consecutive >= data.rules.consecutive;
                    return (
                      <tr key={p.id}>
                        <td>
                          <div className="flex items-center gap-3">
                            <Avatar name={p.name} color={p.color} />
                            <div>
                              <p className="font-semibold">{p.name}</p>
                              <p className="mt-1 text-xs text-muted">
                                {p.course}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td>
                          {a.attended} / {a.total}
                        </td>
                        <td className="font-semibold">
                          {a.percent === null
                            ? "No confirmed data"
                            : `${a.percent.toFixed(1)}%`}
                          {a.unknown > 0 && (
                            <span className="ml-2 text-xs font-normal text-muted">
                              Provisional
                            </span>
                          )}
                        </td>
                        <td>
                          <Badge value={flag ? "attention" : "healthy"}>
                            {flag ? "Check-in suggested" : "On track"}
                          </Badge>
                        </td>
                        <td>
                          <IconButton
                            label={`View attendance for ${p.name}`}
                            onClick={() => open({ type: "person", id: p.id })}
                          >
                            <ArrowUpRight size={16} />
                          </IconButton>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState
              icon={CalendarCheck2}
              title="No matching attendance"
              description="Try a different student name."
            />
          )
        ) : tab === "records" ? (
          meetings.length ? (
            <div className="table-scroll">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Meeting</th>
                    <th>Student</th>
                    <th>Outcome</th>
                    <th>
                      <span className="sr-only">Manage record</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {meetings.map((m) => (
                    <tr key={m.id}>
                      <td>
                        <p className="font-medium">{m.title}</p>
                        <p className="mt-1 text-xs text-muted">
                          {fullDate(m.date)} · {m.time}
                        </p>
                      </td>
                      <td>
                        {data.people.find((p) => p.id === m.studentId)?.name}
                      </td>
                      <td>
                        <Badge
                          value={m.status === "held" ? m.attendance : m.status}
                        />
                      </td>
                      <td>
                        <Button
                          variant="secondary"
                          onClick={() =>
                            open({
                              type: role === "student" ? "request" : "meeting",
                              id: m.id,
                            })
                          }
                        >
                          {role === "student"
                            ? "Request correction"
                            : "Review record"}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState
              icon={CheckCheck}
              title="No records match this view"
              description="Try another search or attendance outcome."
            />
          )
        ) : (
          <div className="p-6">
            {requests.length ? (
              requests.map((r) => (
                <button
                  key={r.id}
                  onClick={() => open({ type: "review-request", id: r.id })}
                  className="mb-3 flex w-full items-center justify-between gap-4 rounded-xl border border-line p-4 text-left hover:bg-canvas"
                >
                  <div>
                    <p className="text-sm font-semibold">
                      {data.people.find((p) => p.id === r.studentId)?.name}
                    </p>
                    <p className="mt-1 text-xs text-muted">{r.reason}</p>
                  </div>
                  <Badge
                    value={
                      r.status === "pending" ? "awaiting_review" : r.status
                    }
                  />
                </button>
              ))
            ) : (
              <EmptyState
                icon={ClipboardCheck}
                title="Nothing to put right just now"
                description="Students can request a correction from a meeting record. Their request will appear here for review."
              />
            )}
          </div>
        )}
      </section>
    </div>
  );
}
