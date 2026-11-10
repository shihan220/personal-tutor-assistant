import { useNavigate } from "react-router-dom";
import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  CheckCheck,
  ChevronRight,
  ClipboardList,
  FileText,
  GraduationCap,
  MapPin,
  Plus,
  Sparkles,
  TrendingUp,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useWorkspace } from "../context/workspace";
import { useDialogs } from "../context/dialogs";
import { CURRENT_STUDENT, DEMO_DATE, DEMO_NOW } from "../data/seed";
import {
  attendanceFor,
  fullDate,
  meetingDate,
  visibleMeetings,
  visiblePeople,
} from "../lib/utils";
import {
  Avatar,
  Button,
  EmptyState,
  SectionHeader,
  TextLink,
} from "../components/ui";
import { PageHeading } from "../components/PageHeading";
import { StudentTable } from "../components/StudentTable";

function StatCard({
  title,
  value,
  description,
  icon: Icon,
  tint,
  detail,
}: {
  title: string;
  value: string | number;
  description: string;
  icon: LucideIcon;
  tint: string;
  detail?: string;
}) {
  return (
    <div className="stat-card">
      <div className="flex items-start justify-between">
        <p className="text-xs font-medium text-muted">{title}</p>
        <div
          className={`flex size-9 items-center justify-center rounded-xl ${tint}`}
        >
          <Icon size={18} strokeWidth={1.7} />
        </div>
      </div>
      <div className="mt-3 flex items-end gap-2">
        <p className="font-heading text-[31px] font-bold leading-none tracking-tight">
          {value}
        </p>
        {detail && (
          <span className="mb-0.5 flex items-center gap-0.5 text-[10px] font-semibold text-emerald-700">
            <ArrowUpRight size={12} />
            {detail}
          </span>
        )}
      </div>
      <p className="mt-3 text-[11px] text-muted">{description}</p>
    </div>
  );
}

export function OverviewPage() {
  const { data, role } = useWorkspace();
  const { open } = useDialogs();
  const navigate = useNavigate();
  const people = visiblePeople(data, role);
  const ids = new Set(people.map((p) => p.id));
  const meetings = visibleMeetings(data, role);
  const next = meetings
    .filter((m) => m.status === "scheduled" && meetingDate(m) >= DEMO_NOW)
    .sort((a, b) => meetingDate(a).getTime() - meetingDate(b).getTime());
  const today = next.filter((m) => m.date === DEMO_DATE);
  const cases = data.concerns.filter(
    (c) => ids.has(c.studentId) && c.status !== "resolved",
  );
  const average = people
    .map((p) => attendanceFor(data.meetings, p.id).percent)
    .filter((n): n is number => n !== null);
  const rate = average.length
    ? Math.round(average.reduce((a, b) => a + b, 0) / average.length)
    : 0;
  const name =
    role === "tutor" ? "Sarah" : data.profiles[role].name.split(" ")[0];
  const student = role === "student";
  const admin = role === "admin";
  const firstMeeting = next[0];
  return (
    <div className="animate-enter">
      <PageHeading
        eyebrow="TEACHING BLOCK 1 · 2026 / 27"
        title={`Good morning, ${name}`}
        description={
          student
            ? "Your next steps, shared thoughts, and a little support along the way."
            : admin
              ? "A clear view of your people, their access, and your workspace."
              : "A little clarity for your day. A little more support for your students."
        }
        action={
          <Button
            onClick={() =>
              open({
                type: admin
                  ? "account"
                  : student
                    ? "request"
                    : role === "officer"
                      ? "concern"
                      : "meeting-form",
              })
            }
          >
            <Plus size={17} />
            {admin
              ? "Add account"
              : student
                ? "Request a meeting"
                : role === "officer"
                  ? "Raise a concern"
                  : "Schedule a meeting"}
          </Button>
        }
      />
      <div className="mb-7 grid grid-cols-2 gap-3 xl:grid-cols-4 xl:gap-5">
        <StatCard
          title={
            admin
              ? "Student accounts"
              : student
                ? "Your next meeting"
                : "My students"
          }
          value={
            admin
              ? people.length
              : student
                ? firstMeeting
                  ? firstMeeting.time
                  : "—"
                : people.filter((p) => p.active).length
          }
          description={
            student
              ? firstMeeting
                ? fullDate(firstMeeting.date, { weekday: "short" })
                : "Request a check-in anytime"
              : admin
                ? "Across your workspace"
                : role === "officer"
                  ? "Students in cohort A"
                  : "A connection worth keeping"
          }
          icon={student ? CalendarDays : Users}
          tint="bg-lavender text-brand"
        />
        <StatCard
          title={
            admin
              ? "Personal tutors"
              : student
                ? "Meetings attended"
                : "Upcoming meetings"
          }
          value={
            admin
              ? data.tutors.length
              : student
                ? attendanceFor(data.meetings, CURRENT_STUDENT).attended
                : next.length
          }
          description={
            admin
              ? "Available for student assignments"
              : student
                ? "Confirmed this teaching block"
                : `${today.length} ${today.length === 1 ? "meeting" : "meetings"} scheduled for today`
          }
          icon={CalendarDays}
          tint="bg-peach-light text-orange-700"
        />
        <StatCard
          title={admin ? "Active accounts" : "Meeting attendance"}
          value={
            admin
              ? data.people.filter((p) => p.active).length +
                data.staff.filter((s) => s.active).length
              : `${rate}%`
          }
          description={
            admin
              ? "Students and staff combined"
              : "Confirmed tutor meetings this block"
          }
          icon={admin ? CheckCheck : TrendingUp}
          tint="bg-sage-light text-emerald-700"
        />
        <StatCard
          title={
            admin
              ? "Unassigned students"
              : student
                ? "Shared notes"
                : "Open follow-ups"
          }
          value={
            admin
              ? people.filter((p) => !p.tutorId).length
              : student
                ? data.notes.filter((n) => n.studentId === CURRENT_STUDENT)
                    .length
                : cases.length
          }
          description={
            admin
              ? "Everyone deserves a point of contact"
              : student
                ? "A record you can build together"
                : "Small next steps that matter"
          }
          icon={student ? FileText : ClipboardList}
          tint="bg-rose-light text-rose-700"
        />
      </div>
      {admin ? (
        <>
          <section className="panel mb-6">
            <SectionHeader
              title="Your people, connected"
              description="Review student accounts and their personal tutors."
              action={
                <TextLink onClick={() => navigate("/people")}>
                  Manage accounts
                </TextLink>
              }
            />
            <StudentTable people={people.slice(0, 5)} />
          </section>
          <div className="grid gap-5 lg:grid-cols-2">
            <section className="panel">
              <SectionHeader title="A place for every student" />
              <p className="text-sm leading-7 text-muted">
                Keep tutor assignments up to date so every student knows who to
                turn to. Changes are reflected throughout the design preview.
              </p>
              <Button
                variant="secondary"
                className="mt-5"
                onClick={() => navigate("/assignments")}
              >
                Review assignments
                <ArrowRight size={15} />
              </Button>
            </section>
            <section className="panel">
              <SectionHeader title="Recent workspace activity" />
              {data.audit.slice(0, 3).map((a) => (
                <div key={a.id} className="mb-4 flex gap-3">
                  <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-brand-soft" />
                  <div>
                    <p className="text-xs font-medium">{a.action}</p>
                    <p className="mt-1 text-[11px] text-muted">
                      {a.actor} · {fullDate(a.date)}
                    </p>
                  </div>
                </div>
              ))}
            </section>
          </div>
        </>
      ) : (
        <>
          <div className="mb-6 grid items-start gap-6 xl:grid-cols-[1.65fr_1fr]">
            <section className="panel p-0!">
              <div className="px-6 pt-6">
                <SectionHeader
                  title={
                    student ? "Your next conversations" : "On the calendar"
                  }
                  description={
                    student
                      ? "A space to check in and look ahead."
                      : "Make a little time. Make a meaningful difference."
                  }
                  action={
                    <TextLink onClick={() => navigate("/meetings")}>
                      View calendar
                    </TextLink>
                  }
                />
              </div>
              <div className="flex gap-5 border-b border-line px-6 pb-4">
                <span className="tab-active">
                  {today.length ? "Today" : "Coming up"}
                  <span className="ml-2 rounded-full bg-lavender px-1.5 py-0.5 text-[10px] text-brand">
                    {today.length || next.length}
                  </span>
                </span>
                <span className="ml-auto flex items-center gap-1.5 text-[11px] text-muted">
                  <CalendarDays size={12} />
                  Tuesday, 3 November
                </span>
              </div>
              {next.length === 0 ? (
                <EmptyState
                  icon={CalendarDays}
                  title="A little room in your calendar"
                  description="Your upcoming conversations will appear here."
                />
              ) : (
                (today.length ? today : next).slice(0, 3).map((m, i) => {
                  const person = data.people.find((p) => p.id === m.studentId)!;
                  return (
                    <button
                      key={m.id}
                      onClick={() => open({ type: "meeting", id: m.id })}
                      className="group flex w-full items-center gap-4 border-b border-line/70 px-5 py-5 text-left transition-colors last:border-0 hover:bg-canvas sm:px-6"
                    >
                      <div className="w-11 shrink-0">
                        <p className="text-xs font-semibold">{m.time}</p>
                        <p className="mt-1 text-[10px] text-muted">
                          {m.duration} min
                        </p>
                      </div>
                      <div
                        className={`h-11 w-0.5 shrink-0 rounded-full ${i === 0 ? "bg-brand" : i === 1 ? "bg-amber-300" : "bg-emerald-400"}`}
                      />
                      <Avatar
                        name={
                          student
                            ? (data.tutors.find((t) => t.id === m.tutorId)
                                ?.name ?? "Personal tutor")
                            : person.name
                        }
                        color={person.color}
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[13px] font-semibold">
                          {student ? "Dr Sarah Mitchell" : person.name}
                        </p>
                        <p className="mt-1 truncate text-xs text-muted">
                          {m.title}
                        </p>
                        <p className="mt-2 flex items-center gap-1 text-[10px] text-muted">
                          <MapPin size={11} />
                          {m.kind === "online"
                            ? "Online meeting"
                            : "Mercantile House, 2.14"}
                        </p>
                      </div>
                      <ChevronRight
                        size={16}
                        className="text-muted transition-transform group-hover:translate-x-1"
                      />
                    </button>
                  );
                })
              )}
            </section>
            <section className="panel">
              <SectionHeader
                title={
                  student
                    ? "Your corner of support"
                    : "A little attention goes a long way"
                }
                action={
                  <span className="flex size-7 items-center justify-center rounded-lg bg-peach-light text-orange-700">
                    <Sparkles size={15} />
                  </span>
                }
              />
              {student ? (
                <>
                  <div className="rounded-xl bg-lavender p-5">
                    <p className="font-heading text-lg font-bold leading-7">
                      You don’t need to have it all figured out.
                    </p>
                    <p className="mt-3 text-xs leading-6 text-muted">
                      Your personal tutor is here to listen, help you find your
                      feet, and work through what comes next.
                    </p>
                    <button
                      onClick={() => open({ type: "request" })}
                      className="mt-4 inline-flex items-center gap-2 text-xs font-semibold text-brand"
                    >
                      Let’s make time to talk
                      <ArrowRight size={13} />
                    </button>
                  </div>
                  <div className="mt-5 flex items-center gap-3">
                    <Avatar name="Dr Sarah Mitchell" />
                    <div>
                      <p className="text-xs font-semibold">Dr Sarah Mitchell</p>
                      <p className="mt-1 text-[11px] text-muted">
                        Your personal tutor
                      </p>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {cases.slice(0, 3).map((c) => {
                    const person = data.people.find(
                      (p) => p.id === c.studentId,
                    )!;
                    return (
                      <button
                        key={c.id}
                        onClick={() => open({ type: "concern", id: c.id })}
                        className="mb-3 flex w-full items-start gap-3 rounded-xl border border-line p-3.5 text-left transition-colors hover:border-brand-soft"
                      >
                        <span
                          className={`mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg ${c.category === "Attendance" ? "bg-peach-light text-orange-700" : "bg-lavender text-brand"}`}
                        >
                          {c.category === "Attendance" ? (
                            <ArrowDownRight size={15} />
                          ) : (
                            <FileText size={14} />
                          )}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-semibold">{person.name}</p>
                          <p className="mt-1 text-[11px] leading-5 text-muted">
                            {c.category === "Attendance"
                              ? "An attendance check-in could help."
                              : "A next step is ready to explore."}
                          </p>
                        </div>
                        <ChevronRight size={13} className="mt-1 text-muted" />
                      </button>
                    );
                  })}
                  <TextLink onClick={() => navigate("/follow-ups")}>
                    See all follow-ups
                  </TextLink>
                </>
              )}
            </section>
          </div>
          <div className="grid items-start gap-6 xl:grid-cols-[1.65fr_1fr]">
            <section className="panel p-0!">
              <div className="px-6 pt-6">
                <SectionHeader
                  title={
                    student
                      ? "Your shared notebook"
                      : "Your students, at a glance"
                  }
                  description={
                    student
                      ? "Keep useful thoughts close to hand."
                      : "Every name is a conversation worth having."
                  }
                  action={
                    <TextLink
                      onClick={() => navigate(student ? "/notes" : "/students")}
                    >
                      {student ? "All notes" : "All students"}
                    </TextLink>
                  }
                />
              </div>
              {student ? (
                <div className="px-6 pb-4">
                  {data.notes
                    .filter((n) => n.studentId === CURRENT_STUDENT)
                    .slice(0, 2)
                    .map((n) => (
                      <button
                        key={n.id}
                        onClick={() => open({ type: "note", id: n.id })}
                        className="mb-3 w-full rounded-xl border border-line p-5 text-left hover:bg-canvas"
                      >
                        <p className="text-sm font-semibold">{n.title}</p>
                        <p className="mt-2 line-clamp-2 text-xs leading-6 text-muted">
                          {n.body}
                        </p>
                        <p className="mt-3 text-[10px] text-muted">
                          {n.author} · {fullDate(n.createdAt)}
                        </p>
                      </button>
                    ))}
                </div>
              ) : (
                <StudentTable people={people.slice(0, 4)} compact />
              )}
            </section>
            <section className="panel">
              <SectionHeader
                title="A picture of engagement"
                description="Confirmed meeting attendance by student"
              />
              <div className="my-5 flex items-baseline gap-2">
                <span className="font-heading text-4xl font-bold tracking-tight">
                  {rate}%
                </span>
                <span className="text-xs text-muted">
                  {student ? "your attendance" : "average this block"}
                </span>
              </div>
              <div className="mb-3 flex h-28 items-end justify-between gap-3 border-b border-line pb-0">
                {people.slice(0, 7).map((p) => {
                  const value = attendanceFor(data.meetings, p.id).percent ?? 0;
                  return (
                    <div
                      key={p.id}
                      className="group relative flex h-full flex-1 items-end justify-center"
                    >
                      <div
                        title={`${p.name}: ${Math.round(value)}%`}
                        className={`w-full max-w-7 rounded-t-md transition-colors ${value < 60 ? "bg-[#e9c9a5] group-hover:bg-[#dbb588]" : "bg-[#c9c1ec] group-hover:bg-brand-soft"}`}
                        style={{ height: `${value}%` }}
                      />
                      <span className="sr-only">
                        {p.name}: {Math.round(value)}%
                      </span>
                    </div>
                  );
                })}
              </div>
              <div className="flex justify-between gap-2">
                {people.slice(0, 7).map((p) => (
                  <span
                    key={p.id}
                    className="flex-1 text-center text-[9px] text-muted"
                  >
                    {p.name.split(" ")[0]}
                  </span>
                ))}
              </div>
              <div className="mt-6 rounded-xl bg-canvas p-3.5">
                <p className="flex items-center gap-2 text-[11px] font-medium">
                  <GraduationCap size={15} className="text-brand" />A starting
                  point for a conversation
                </p>
                <p className="mt-1.5 text-[10px] leading-5 text-muted">
                  Attendance reflects tutor meetings only. Behind every number
                  is a person and their circumstances.
                </p>
              </div>
            </section>
          </div>
        </>
      )}
      <div className="mt-8 flex flex-wrap items-center justify-between gap-3 text-[10px] text-muted">
        <p className="flex items-center gap-1.5">
          <span className="size-1.5 rounded-full bg-emerald-500" />A little more
          connected, one conversation at a time.
        </p>
        <span>Personal tutoring workspace · Teaching block 1</span>
      </div>
    </div>
  );
}
