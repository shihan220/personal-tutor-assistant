import { useState } from "react";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock3,
  List,
  MapPin,
  Plus,
} from "lucide-react";
import { useWorkspace } from "../context/workspace";
import { useDialogs } from "../context/dialogs";
import { DEMO_DATE, DEMO_NOW } from "../data/seed";
import {
  fullDate,
  meetingDate,
  meetingTime,
  visibleMeetings,
  visiblePeople,
} from "../lib/utils";
import {
  Avatar,
  Badge,
  Button,
  EmptyState,
  IconButton,
  SearchField,
} from "../components/ui";
import { PageHeading } from "../components/PageHeading";

export function MeetingsPage() {
  const { data, role } = useWorkspace();
  const { open } = useDialogs();
  const [tab, setTab] = useState("upcoming");
  const [view, setView] = useState("list");
  const [query, setQuery] = useState("");
  const [month, setMonth] = useState(new Date("2026-11-01T12:00:00Z"));
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const student = role === "student";
  const people = visiblePeople(data, role);
  const ids = new Set(people.map((p) => p.id));
  const requests = data.requests.filter(
    (r) => ids.has(r.studentId) && r.kind !== "correction",
  );
  const meetings = visibleMeetings(data, role)
    .filter((m) =>
      `${m.title} ${data.people.find((p) => p.id === m.studentId)?.name}`
        .toLowerCase()
        .includes(query.toLowerCase()),
    )
    .filter((m) =>
      tab === "past"
        ? meetingDate(m) < DEMO_NOW ||
          ["cancelled", "superseded"].includes(m.status)
        : m.status === "scheduled" && meetingDate(m) >= DEMO_NOW,
    )
    .sort(
      (a, b) =>
        (meetingDate(a).getTime() - meetingDate(b).getTime()) *
        (tab === "past" ? -1 : 1),
    );
  const start =
    (new Date(month.getFullYear(), month.getMonth(), 1).getDay() + 6) % 7;
  const cells = Array.from(
    {
      length:
        Math.ceil(
          (start +
            new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate()) /
            7,
        ) * 7,
    },
    (_, i) => {
      const day = new Date(
        Date.UTC(month.getFullYear(), month.getMonth(), i - start + 1, 12),
      );
      return { day, key: day.toISOString().slice(0, 10) };
    },
  );
  return (
    <div className="animate-enter">
      <PageHeading
        title="Make time for a conversation"
        description="Your check-ins, thoughtfully organised in one place."
        action={
          role !== "officer" ? (
            <Button
              onClick={() =>
                open({ type: student ? "request" : "meeting-form" })
              }
            >
              <Plus size={17} />
              {student ? "Request a meeting" : "Schedule a meeting"}
            </Button>
          ) : undefined
        }
      />
      <section className="panel p-0!">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-6 pt-4">
          <div className="flex gap-6">
            {[
              ["upcoming", "Upcoming"],
              ["past", "Past meetings"],
              [
                "requests",
                `Requests${requests.filter((r) => r.status === "pending").length ? ` (${requests.filter((r) => r.status === "pending").length})` : ""}`,
              ],
            ].map(([key, label]) => (
              <button
                key={key}
                onClick={() => setTab(key)}
                className={`nav-tab ${tab === key ? "selected" : ""}`}
              >
                {label}
              </button>
            ))}
          </div>
          {tab !== "requests" && (
            <div className="mb-3 flex rounded-lg border border-line p-1">
              {[
                ["list", List],
                ["calendar", CalendarDays],
              ].map(([value, Icon]) => {
                const I = Icon as typeof List;
                return (
                  <button
                    key={String(value)}
                    aria-label={`${value} view`}
                    aria-pressed={view === value}
                    onClick={() => {
                      setView(String(value));
                      setSelectedDate(null);
                    }}
                    className={`rounded-md p-1.5 ${view === value ? "bg-lavender text-brand" : "text-muted"}`}
                  >
                    <I size={16} />
                  </button>
                );
              })}
            </div>
          )}
        </div>
        {tab === "requests" ? (
          <div className="p-6">
            {requests.length ? (
              requests.map((r) => (
                <button
                  key={r.id}
                  onClick={() => open({ type: "review-request", id: r.id })}
                  className="mb-3 flex w-full items-center gap-4 rounded-xl border border-line p-4 text-left hover:bg-canvas"
                >
                  <div className="flex size-10 items-center justify-center rounded-xl bg-lavender text-brand">
                    <CalendarDays size={19} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold">{r.title}</p>
                    <p className="mt-1 text-xs text-muted">
                      {data.people.find((p) => p.id === r.studentId)?.name} ·{" "}
                      {fullDate(r.date)} at {r.time}
                    </p>
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
                icon={CalendarDays}
                title="No requests waiting here"
                description="New meeting and rescheduling requests will appear in this space."
              />
            )}
          </div>
        ) : (
          <>
            <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-5">
              <div className="w-full sm:w-72">
                <SearchField
                  placeholder="Search meetings or students"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </div>
              <span className="text-xs text-muted">
                {meetings.length}{" "}
                {meetings.length === 1 ? "meeting" : "meetings"} · Europe/London
              </span>
            </div>
            {view === "calendar" && (
              <div className="px-4 pb-5 sm:px-6">
                <div className="mb-5 flex items-center justify-between">
                  <h2 className="font-heading text-lg font-bold">
                    {fullDate(month.toISOString(), {
                      month: "long",
                      year: "numeric",
                      day: undefined,
                    })}
                  </h2>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="secondary"
                      onClick={() => {
                        setMonth(new Date("2026-11-01T12:00:00Z"));
                        setSelectedDate(DEMO_DATE);
                      }}
                    >
                      Today
                    </Button>
                    <IconButton
                      label="Previous month"
                      onClick={() =>
                        setMonth(
                          new Date(
                            Date.UTC(
                              month.getFullYear(),
                              month.getMonth() - 1,
                              1,
                              12,
                            ),
                          ),
                        )
                      }
                    >
                      <ChevronLeft size={18} />
                    </IconButton>
                    <IconButton
                      label="Next month"
                      onClick={() =>
                        setMonth(
                          new Date(
                            Date.UTC(
                              month.getFullYear(),
                              month.getMonth() + 1,
                              1,
                              12,
                            ),
                          ),
                        )
                      }
                    >
                      <ChevronRight size={18} />
                    </IconButton>
                  </div>
                </div>
                <div className="grid grid-cols-7">
                  {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(
                    (d) => (
                      <span
                        key={d}
                        className="pb-3 text-center text-[10px] font-semibold text-muted"
                      >
                        {d}
                      </span>
                    ),
                  )}
                </div>
                <div className="grid grid-cols-7 overflow-hidden rounded-xl border-l border-t border-line">
                  {cells.map(({ day, key }) => {
                    const dayMeetings = meetings.filter((m) => m.date === key);
                    return (
                      <button
                        key={key}
                        onClick={() => setSelectedDate(key)}
                        aria-label={`${fullDate(key, { month: "long" })}, ${dayMeetings.length} meetings`}
                        className={`min-h-23 border-b border-r border-line p-2 text-left transition-colors sm:min-h-28 ${selectedDate === key ? "bg-lavender" : "hover:bg-canvas"} ${day.getMonth() !== month.getMonth() ? "text-stone-300" : ""}`}
                      >
                        <span
                          className={`mb-2 flex size-6 items-center justify-center rounded-full text-xs ${key === DEMO_DATE ? "bg-brand font-semibold text-white" : ""}`}
                        >
                          {day.getDate()}
                        </span>
                        {dayMeetings.slice(0, 2).map((m) => (
                          <span
                            key={m.id}
                            className="mb-1 block truncate rounded bg-lavender px-1.5 py-1 text-[9px] text-brand sm:text-[10px]"
                          >
                            <span className="font-semibold">{m.time}</span>
                            <span className="hidden sm:inline">
                              {" "}
                              {
                                data.people
                                  .find((p) => p.id === m.studentId)
                                  ?.name.split(" ")[0]
                              }
                            </span>
                          </span>
                        ))}
                        {dayMeetings.length > 2 && (
                          <span className="text-[9px] text-muted">
                            +{dayMeetings.length - 2} more
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
                {selectedDate && (
                  <h3 className="mt-6 text-sm font-semibold">
                    Meetings for {fullDate(selectedDate)}
                  </h3>
                )}
              </div>
            )}
            {(view === "list" || selectedDate) && (
              <div>
                {meetings.filter(
                  (m) => !selectedDate || m.date === selectedDate,
                ).length ? (
                  meetings
                    .filter((m) => !selectedDate || m.date === selectedDate)
                    .map((m) => {
                      const p = data.people.find(
                        (person) => person.id === m.studentId,
                      )!;
                      return (
                        <button
                          key={m.id}
                          onClick={() => open({ type: "meeting", id: m.id })}
                          className="flex w-full items-center gap-3 border-t border-line px-4 py-5 text-left transition-colors hover:bg-canvas sm:gap-4 sm:px-6"
                        >
                          <div className="flex size-12 shrink-0 flex-col items-center justify-center rounded-xl bg-canvas">
                            <span className="text-[9px] font-semibold uppercase text-muted">
                              {fullDate(m.date, {
                                month: "short",
                                day: undefined,
                              })}
                            </span>
                            <span className="text-lg font-semibold">
                              {Number(m.date.slice(-2))}
                            </span>
                          </div>
                          <span className="hidden sm:block">
                            <Avatar name={p.name} color={p.color} />
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold">{m.title}</p>
                            <p className="mt-1 text-xs text-muted">
                              {student
                                ? data.tutors.find((t) => t.id === m.tutorId)
                                    ?.name
                                : p.name}
                            </p>
                            <div className="mt-2 flex flex-wrap gap-3 text-[10px] text-muted">
                              <span className="flex items-center gap-1">
                                <Clock3 size={11} />
                                {meetingTime(m)}
                              </span>
                              <span className="flex items-center gap-1">
                                <MapPin size={11} />
                                {m.kind === "online" ? "Online" : "In person"}
                              </span>
                            </div>
                            <span className="mt-3 inline-flex sm:hidden">
                              <Badge
                                value={
                                  m.status === "held" ? m.attendance : m.status
                                }
                              />
                            </span>
                          </div>
                          <span className="hidden sm:block">
                            <Badge
                              value={
                                m.status === "held" ? m.attendance : m.status
                              }
                            />
                          </span>
                          <ChevronRight size={16} className="text-muted" />
                        </button>
                      );
                    })
                ) : (
                  <EmptyState
                    icon={CalendarDays}
                    title="A little breathing room"
                    description="There are no meetings matching this view. Try another date or search."
                  />
                )}
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}
