import { useState } from "react";
import { ArrowUpRight, Plus, Users } from "lucide-react";
import { useWorkspace } from "../context/workspace";
import { useDialogs } from "../context/dialogs";
import { ROLE_LABELS } from "../data/seed";
import { visiblePeople } from "../lib/utils";
import {
  Avatar,
  Badge,
  Button,
  EmptyState,
  IconButton,
  SearchField,
} from "../components/ui";
import { PageHeading } from "../components/PageHeading";
import { StudentTable } from "../components/StudentTable";

export function PeoplePage({ assignments = false }: { assignments?: boolean }) {
  const { data, role } = useWorkspace();
  const { open } = useDialogs();
  const [query, setQuery] = useState("");
  const [course, setCourse] = useState("all");
  const [tab, setTab] = useState("students");
  const admin = role === "admin";
  const people = visiblePeople(data, role).filter(
    (p) =>
      `${p.name} ${p.email}`.toLowerCase().includes(query.toLowerCase()) &&
      (course === "all" || p.course === course),
  );
  const staff = data.staff.filter((s) =>
    `${s.name} ${s.email}`.toLowerCase().includes(query.toLowerCase()),
  );
  return (
    <div className="animate-enter">
      <PageHeading
        title={
          assignments
            ? "The right connection matters"
            : admin
              ? "The people in your workspace"
              : "Every student, a story"
        }
        description={
          assignments
            ? "Give every student a named personal tutor and a place to turn."
            : admin
              ? "Manage accounts, access, and the connections that support students."
              : "Keep your students close, and their next steps a little clearer."
        }
        action={
          admin && !assignments ? (
            <Button onClick={() => open({ type: "account" })}>
              <Plus size={17} />
              Add account
            </Button>
          ) : undefined
        }
      />
      <section className="panel p-0!">
        {admin && !assignments && (
          <div className="flex gap-6 border-b border-line px-6">
            {["students", "staff"].map((value) => (
              <button
                key={value}
                className={`nav-tab capitalize ${tab === value ? "selected" : ""}`}
                onClick={() => setTab(value)}
              >
                {value}
                <span className="ml-2 text-[10px] text-muted">
                  {value === "students"
                    ? data.people.length
                    : data.staff.length}
                </span>
              </button>
            ))}
          </div>
        )}
        <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-5">
          <div className="w-full sm:w-72">
            <SearchField
              placeholder={
                tab === "staff" ? "Search staff accounts" : "Search students"
              }
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          {tab === "students" && (
            <select
              aria-label="Filter by course"
              className="input w-full! sm:w-52!"
              value={course}
              onChange={(e) => setCourse(e.target.value)}
            >
              <option value="all">All courses</option>
              {[...new Set(data.people.map((p) => p.course))].map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          )}
        </div>
        {tab === "staff" && !assignments ? (
          staff.length ? (
            <div className="table-scroll">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Team member</th>
                    <th>Role</th>
                    <th>Scope</th>
                    <th>Status</th>
                    <th>
                      <span className="sr-only">Edit</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {staff.map((s) => (
                    <tr key={s.id}>
                      <td>
                        <div className="flex items-center gap-3">
                          <Avatar name={s.name} />
                          <div>
                            <p className="font-semibold">{s.name}</p>
                            <p className="mt-1 text-xs text-muted">{s.email}</p>
                          </div>
                        </div>
                      </td>
                      <td>{ROLE_LABELS[s.role]}</td>
                      <td>
                        {s.cohort === "All"
                          ? "Workspace"
                          : `Cohort ${s.cohort}`}
                      </td>
                      <td>
                        <Badge value={s.active ? "active" : "inactive"} />
                      </td>
                      <td>
                        <IconButton
                          label={`Edit ${s.name}`}
                          onClick={() => open({ type: "account", id: s.id })}
                        >
                          <ArrowUpRight size={16} />
                        </IconButton>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState
              icon={Users}
              title="No matching team members"
              description="Try a different name or email address."
            />
          )
        ) : people.length ? (
          assignments ? (
            <div className="table-scroll">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Cohort</th>
                    <th>Personal tutor</th>
                    <th>
                      <span className="sr-only">Change assignment</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {people.map((p) => (
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
                      <td>Cohort {p.cohort}</td>
                      <td>
                        {data.tutors.find((t) => t.id === p.tutorId)?.name ??
                          "Not assigned"}
                      </td>
                      <td>
                        <Button
                          variant="secondary"
                          onClick={() => open({ type: "account", id: p.id })}
                        >
                          Change tutor
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <StudentTable people={people} />
          )
        ) : (
          <EmptyState
            icon={Users}
            title="No students match your search"
            description="Try another name or choose a different course."
          />
        )}
        <div className="border-t border-line px-6 py-4 text-xs text-muted">
          Showing{" "}
          {tab === "staff" && !assignments ? staff.length : people.length}{" "}
          {tab === "staff" && !assignments ? "staff accounts" : "students"}
          {role === "officer" ? " · Cohort A" : ""}
        </div>
      </section>
    </div>
  );
}
