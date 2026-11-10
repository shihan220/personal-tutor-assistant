import { useState } from "react";
import {
  ArrowUpRight,
  CalendarDays,
  ClipboardList,
  LayoutGrid,
  List,
  Plus,
  ShieldCheck,
} from "lucide-react";
import { useWorkspace } from "../context/workspace";
import { useDialogs } from "../context/dialogs";
import { fullDate, visiblePeople } from "../lib/utils";
import {
  Avatar,
  Badge,
  Button,
  EmptyState,
  SearchField,
} from "../components/ui";
import { PageHeading } from "../components/PageHeading";
import type { Concern } from "../types";

export function FollowUpsPage() {
  const { data, role } = useWorkspace();
  const { open } = useDialogs();
  const [query, setQuery] = useState("");
  const [view, setView] = useState("board");
  const [includeResolved, setIncludeResolved] = useState(false);
  const ids = new Set(visiblePeople(data, role).map((p) => p.id));
  const student = role === "student";
  const concerns = data.concerns.filter(
    (c) =>
      ids.has(c.studentId) &&
      (!student || c.studentSummary) &&
      (includeResolved || c.status !== "resolved") &&
      `${c.title} ${data.people.find((p) => p.id === c.studentId)?.name}`
        .toLowerCase()
        .includes(query.toLowerCase()),
  );
  const card = (c: Concern) => {
    const p = data.people.find((person) => person.id === c.studentId)!;
    return (
      <button
        key={c.id}
        onClick={() => open({ type: "concern", id: c.id })}
        className="group mb-4 w-full rounded-xl border border-line bg-white p-5 text-left transition-all hover:border-brand-soft hover:shadow-sm"
      >
        <div className="mb-4 flex items-center justify-between gap-2">
          <span className="text-[10px] font-medium text-brand">
            {c.category}
          </span>
          <ArrowUpRight
            size={15}
            className="text-muted group-hover:text-brand"
          />
        </div>
        <h3 className="text-sm font-semibold leading-6">{c.title}</h3>
        <div className="mt-4 flex items-center gap-2">
          <Avatar name={p.name} color={p.color} size="sm" />
          <span className="text-xs font-medium">{p.name}</span>
        </div>
        {role === "officer" && (
          <p className="mt-4 line-clamp-2 text-xs leading-6 text-muted">
            {c.summary}
          </p>
        )}
        <div className="mt-4 flex items-center justify-between border-t border-line pt-3 text-[10px] text-muted">
          <span className="flex items-center gap-1">
            <CalendarDays size={12} />
            Due {fullDate(c.dueDate)}
          </span>
          <span>{c.owner}</span>
        </div>
      </button>
    );
  };
  return (
    <div className="animate-enter">
      <PageHeading
        title={
          student
            ? "A little support for your next step"
            : "Turn a concern into a conversation"
        }
        description={
          student
            ? "Practical encouragement from the people here to help you."
            : "Clear ownership, thoughtful next steps, and no one left waiting."
        }
        action={
          !student ? (
            <Button onClick={() => open({ type: "concern" })}>
              <Plus size={17} />
              Raise a concern
            </Button>
          ) : undefined
        }
      />
      {student ? (
        concerns.length ? (
          <div className="grid gap-5 lg:grid-cols-2">
            {concerns.map((c) => (
              <section className="panel" key={c.id}>
                <div className="mb-5 flex items-center gap-3">
                  <span className="flex size-10 items-center justify-center rounded-xl bg-lavender text-brand">
                    <ShieldCheck size={20} />
                  </span>
                  <div>
                    <h2 className="font-heading font-bold">{c.title}</h2>
                    <p className="mt-1 text-xs text-muted">
                      From {c.owner} · Student support
                    </p>
                  </div>
                </div>
                <p className="whitespace-pre-line text-sm leading-8 text-muted">
                  {c.studentSummary}
                </p>
                <div className="mt-6 border-t border-line pt-5">
                  <Button
                    variant="secondary"
                    onClick={() => open({ type: "request" })}
                  >
                    Talk it through with your tutor
                    <ArrowUpRight size={15} />
                  </Button>
                </div>
              </section>
            ))}
          </div>
        ) : (
          <section className="panel">
            <EmptyState
              icon={ShieldCheck}
              title="Support is here when you need it"
              description="Any shared support plans will appear here. You can always request a conversation with your tutor."
              action={
                <Button onClick={() => open({ type: "request" })}>
                  Request a meeting
                </Button>
              }
            />
          </section>
        )
      ) : (
        <>
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div className="w-full sm:w-80">
              <SearchField
                placeholder="Search follow-ups or students"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-5">
              <label className="flex items-center gap-2 text-xs text-muted">
                <input
                  type="checkbox"
                  className="accent-brand"
                  checked={includeResolved}
                  onChange={(e) => setIncludeResolved(e.target.checked)}
                />
                Include resolved
              </label>
              <div className="flex rounded-lg border border-line bg-white p-1">
                {[
                  ["board", LayoutGrid],
                  ["list", List],
                ].map(([key, Icon]) => {
                  const I = Icon as typeof List;
                  return (
                    <button
                      key={String(key)}
                      aria-label={`${key} view`}
                      aria-pressed={view === key}
                      onClick={() => setView(String(key))}
                      className={`rounded-md p-2 ${view === key ? "bg-lavender text-brand" : "text-muted"}`}
                    >
                      <I size={16} />
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
          {!concerns.length ? (
            <section className="panel">
              <EmptyState
                icon={ClipboardList}
                title="Nothing waiting in this view"
                description="Try another search or include resolved follow-ups."
              />
            </section>
          ) : view === "board" ? (
            <div className="grid items-start gap-5 lg:grid-cols-3">
              {[
                ["awaiting_review", "Needs a first look"],
                ["in_progress", "Moving forward"],
                ["resolved", "A step completed"],
              ].map(([key, label]) => {
                const items = concerns.filter(
                  (c) =>
                    c.status === key ||
                    (key === "awaiting_review" && c.status === "escalated"),
                );
                return (
                  <section
                    key={key}
                    className="rounded-2xl border border-line/80 bg-[#f3f2ee] p-4"
                  >
                    <div className="mb-5 flex items-center justify-between">
                      <h2 className="text-xs font-semibold">{label}</h2>
                      <span className="flex size-5 items-center justify-center rounded-md bg-white text-[10px] text-muted">
                        {items.length}
                      </span>
                    </div>
                    {items.map(card)}
                    {!items.length && (
                      <div className="flex min-h-40 flex-col items-center justify-center rounded-xl border border-dashed border-stone-300 px-4 text-center">
                        <ClipboardList
                          size={20}
                          className="mb-3 text-stone-400"
                        />
                        <p className="text-xs text-muted">
                          {key === "resolved" && !includeResolved
                            ? "Include resolved to see completed steps."
                            : "A little breathing room."}
                        </p>
                      </div>
                    )}
                  </section>
                );
              })}
            </div>
          ) : (
            <section className="panel p-0!">
              <div className="table-scroll">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Follow-up</th>
                      <th>Student</th>
                      <th>Owner</th>
                      <th>Due</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {concerns.map((c) => (
                      <tr key={c.id}>
                        <td>
                          <button
                            className="text-left font-semibold hover:text-brand"
                            onClick={() => open({ type: "concern", id: c.id })}
                          >
                            {c.title}
                          </button>
                        </td>
                        <td>
                          {data.people.find((p) => p.id === c.studentId)?.name}
                        </td>
                        <td>{c.owner}</td>
                        <td>{fullDate(c.dueDate)}</td>
                        <td>
                          <Badge value={c.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}
          <p className="mt-5 text-xs leading-6 text-muted">
            {role === "tutor"
              ? "You can review current tutees’ follow-up status and released support plans. Officer-only narrative stays restricted."
              : "Officer workspace · Cohort A. Student messages are released separately from internal follow-up notes."}
          </p>
        </>
      )}
    </div>
  );
}
