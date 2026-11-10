import { ArrowUpRight } from "lucide-react";
import { useWorkspace } from "../context/workspace";
import { useDialogs } from "../context/dialogs";
import { attendanceFor } from "../lib/utils";
import { Avatar, Badge, IconButton } from "./ui";
import type { Person } from "../types";

export function StudentTable({
  people,
  compact = false,
}: {
  people: Person[];
  compact?: boolean;
}) {
  const { data, role } = useWorkspace();
  const { open } = useDialogs();
  return (
    <div className="table-scroll">
      <table className="data-table">
        <thead>
          <tr>
            <th>Student</th>
            <th>{role === "admin" ? "Personal tutor" : "Course / year"}</th>
            <th>
              {role === "admin" ? "Account status" : "Meeting attendance"}
            </th>
            {!compact && <th>Cohort</th>}
            <th>
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {people.map((person) => {
            const stats = attendanceFor(data.meetings, person.id);
            const attention =
              (stats.percent !== null &&
                stats.percent < data.rules.threshold) ||
              stats.consecutive >= data.rules.consecutive;
            return (
              <tr key={person.id}>
                <td>
                  <button
                    className="flex items-center gap-3 text-left"
                    onClick={() => open({ type: "person", id: person.id })}
                  >
                    <Avatar name={person.name} color={person.color} />
                    <span>
                      <span className="block font-semibold text-ink">
                        {person.name}
                      </span>
                      <span className="mt-1 block text-xs text-muted">
                        {person.email}
                      </span>
                    </span>
                  </button>
                </td>
                <td>
                  <p className="text-[13px]">
                    {role === "admin"
                      ? (data.tutors.find((t) => t.id === person.tutorId)
                          ?.name ?? "Unassigned")
                      : person.course}
                  </p>
                  <p className="mt-1 text-xs text-muted">
                    {role === "admin"
                      ? `Cohort ${person.cohort}`
                      : `Year ${person.year}`}
                  </p>
                </td>
                <td>
                  {role === "admin" ? (
                    <Badge value={person.active ? "active" : "inactive"} />
                  ) : (
                    <div className="flex items-center gap-3">
                      <div className="w-20">
                        <div className="h-1.5 overflow-hidden rounded-full bg-stone-100">
                          <div
                            className={`h-full rounded-full ${attention ? "bg-amber-400" : "bg-brand-soft"}`}
                            style={{ width: `${stats.percent ?? 0}%` }}
                          />
                        </div>
                      </div>
                      <span
                        className={`text-xs font-semibold ${attention ? "text-amber-700" : "text-ink"}`}
                      >
                        {stats.percent === null
                          ? "—"
                          : `${Math.round(stats.percent)}%`}
                      </span>
                    </div>
                  )}
                </td>
                {!compact && (
                  <td>
                    <span className="rounded-md bg-canvas px-2.5 py-1 text-xs text-muted">
                      Cohort {person.cohort}
                    </span>
                  </td>
                )}
                <td>
                  <IconButton
                    label={`View ${person.name}`}
                    onClick={() => open({ type: "person", id: person.id })}
                  >
                    <ArrowUpRight size={17} />
                  </IconButton>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
