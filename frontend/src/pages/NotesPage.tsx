import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { ArrowUpRight, FileText, Plus, ShieldCheck } from "lucide-react";
import { useWorkspace } from "../context/workspace";
import { useDialogs } from "../context/dialogs";
import { fullDate, visiblePeople } from "../lib/utils";
import { Avatar, Button, EmptyState, SearchField } from "../components/ui";
import { PageHeading } from "../components/PageHeading";

export function NotesPage() {
  const { data, role } = useWorkspace();
  const { open } = useDialogs();
  const [params, setParams] = useSearchParams();
  const [query, setQuery] = useState("");
  const people = visiblePeople(data, role);
  const ids = new Set(people.map((p) => p.id));
  const student = params.get("student") ?? "all";
  const notes = data.notes
    .filter(
      (n) =>
        ids.has(n.studentId) &&
        (student === "all" || n.studentId === student) &&
        `${n.title} ${n.body}`.toLowerCase().includes(query.toLowerCase()),
    )
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return (
    <div className="animate-enter">
      <PageHeading
        title="Good conversations, remembered"
        description="A shared space for reflections, questions, and what comes next."
        action={
          <Button
            onClick={() =>
              open({
                type: "note",
                studentId: student === "all" ? undefined : student,
              })
            }
          >
            <Plus size={17} />
            Add a shared note
          </Button>
        }
      />
      <div className="info-box mb-6">
        <ShieldCheck size={18} className="shrink-0" />
        <p>
          Shared notes are visible to the student and their current personal
          tutor. Only the author can edit their contribution.
        </p>
      </div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="w-full sm:w-80">
          <SearchField
            placeholder="Find a thought or conversation"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        {role === "tutor" && (
          <select
            aria-label="Filter notes by student"
            className="input w-full! sm:w-52!"
            value={student}
            onChange={(e) =>
              setParams(
                e.target.value === "all" ? {} : { student: e.target.value },
              )
            }
          >
            <option value="all">All my students</option>
            {people.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        )}
      </div>
      {notes.length ? (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {notes.map((n) => {
            const p = people.find((person) => person.id === n.studentId)!;
            return (
              <button
                key={n.id}
                onClick={() => open({ type: "note", id: n.id })}
                className="group panel flex min-h-68 flex-col text-left transition-all hover:-translate-y-0.5 hover:border-brand-soft hover:shadow-md"
              >
                <div className="mb-5 flex items-center justify-between">
                  <span className="flex size-9 items-center justify-center rounded-xl bg-lavender text-brand">
                    <FileText size={17} />
                  </span>
                  <span className="text-[10px] text-muted">
                    {fullDate(n.createdAt)}
                  </span>
                </div>
                <h2 className="font-heading text-base font-bold leading-7">
                  {n.title}
                </h2>
                <p className="mt-3 mb-6 line-clamp-3 whitespace-pre-line text-xs leading-6 text-muted">
                  {n.body}
                </p>
                <div className="mt-auto flex items-center gap-2 border-t border-line pt-4">
                  <Avatar name={p.name} color={p.color} size="sm" />
                  <div className="min-w-0">
                    <p className="truncate text-[11px] font-semibold">
                      {p.name}
                    </p>
                    <p className="mt-0.5 text-[10px] text-muted">
                      By{" "}
                      {n.authorRole === "tutor" ? "personal tutor" : "student"}
                      {n.revisions ? ` · Edited ${n.revisions}×` : ""}
                    </p>
                  </div>
                  <ArrowUpRight
                    size={15}
                    className="ml-auto text-muted group-hover:text-brand"
                  />
                </div>
              </button>
            );
          })}
        </div>
      ) : (
        <section className="panel">
          <EmptyState
            icon={FileText}
            title="Every good note starts somewhere"
            description="No notes match this view. Clear your search or add a reflection to begin."
            action={
              <Button
                onClick={() =>
                  open({
                    type: "note",
                    studentId: student === "all" ? undefined : student,
                  })
                }
              >
                Write a note
              </Button>
            }
          />
        </section>
      )}
    </div>
  );
}
