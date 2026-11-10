import type { DemoData, Meeting, Person, Role } from "../types";
import {
  CURRENT_STUDENT,
  CURRENT_TUTOR,
  DEMO_NOW,
  OFFICER_COHORT,
} from "../data/seed";

export const uid = () => crypto.randomUUID();
export const initials = (name: string) =>
  name
    .replace(/^Dr\s/, "")
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("");
export const fullDate = (value: string, options?: Intl.DateTimeFormatOptions) =>
  new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    ...options,
    timeZone: "Europe/London",
  }).format(new Date(value.length === 10 ? `${value}T12:00:00Z` : value));
export const meetingTime = (m: Meeting) =>
  `${m.time} – ${minutesToTime(timeToMinutes(m.time) + m.duration)}`;
export const timeToMinutes = (time: string) =>
  Number(time.split(":")[0]) * 60 + Number(time.split(":")[1]);
export const minutesToTime = (value: number) =>
  `${Math.floor(value / 60)
    .toString()
    .padStart(2, "0")}:${(value % 60).toString().padStart(2, "0")}`;
export const meetingDate = (m: Meeting) => new Date(`${m.date}T${m.time}:00Z`);
export const statusLabel = (value: string) =>
  ({
    awaiting_review: "Needs review",
    in_progress: "In progress",
    tutor_unavailable: "Tutor unavailable",
    unrecorded: "Not recorded",
    scheduled: "Upcoming",
    held: "Completed",
    superseded: "Rescheduled",
  })[value] ?? value.replaceAll("_", " ").replace(/^./, (c) => c.toUpperCase());
export function visiblePeople(data: DemoData, role: Role): Person[] {
  if (role === "student")
    return data.people.filter((p) => p.id === CURRENT_STUDENT);
  if (role === "tutor")
    return data.people.filter((p) => p.tutorId === CURRENT_TUTOR);
  if (role === "officer")
    return data.people.filter((p) => p.cohort === OFFICER_COHORT);
  return data.people;
}
export function visibleMeetings(data: DemoData, role: Role) {
  if (role === "admin") return [];
  const ids = new Set(visiblePeople(data, role).map((p) => p.id));
  return data.meetings.filter(
    (m) =>
      ids.has(m.studentId) && (role !== "tutor" || m.tutorId === CURRENT_TUTOR),
  );
}
export function attendanceFor(meetings: Meeting[], studentId: string) {
  const past = meetings
    .filter(
      (m) =>
        m.studentId === studentId &&
        m.required &&
        meetingDate(m).getTime() + m.duration * 60000 <= DEMO_NOW.getTime() &&
        !["cancelled", "superseded", "tutor_unavailable"].includes(m.status),
    )
    .sort((a, b) => meetingDate(a).getTime() - meetingDate(b).getTime());
  const confirmed = past.filter(
    (m) =>
      m.status === "held" &&
      ["present", "late", "absent"].includes(m.attendance),
  );
  const attended = confirmed.filter((m) =>
    ["present", "late"].includes(m.attendance),
  ).length;
  const unknown = past.filter(
    (m) => m.status === "scheduled" || m.attendance === "unrecorded",
  ).length;
  let consecutive = 0;
  for (const meeting of past) {
    if (meeting.attendance === "excused") continue;
    consecutive =
      meeting.status === "held" && meeting.attendance === "absent"
        ? consecutive + 1
        : 0;
  }
  return {
    percent: confirmed.length ? (attended / confirmed.length) * 100 : null,
    attended,
    total: confirmed.length,
    unknown,
    consecutive,
  };
}
export function hasClash(
  meetings: Meeting[],
  candidate: Meeting,
  excludeId?: string,
) {
  const start = timeToMinutes(candidate.time);
  return meetings.some(
    (m) =>
      m.id !== excludeId &&
      m.date === candidate.date &&
      m.status === "scheduled" &&
      (m.studentId === candidate.studentId ||
        m.tutorId === candidate.tutorId) &&
      start < timeToMinutes(m.time) + m.duration &&
      start + candidate.duration > timeToMinutes(m.time),
  );
}
export function downloadCsv(filename: string, rows: (string | number)[][]) {
  const csv = rows
    .map((row) =>
      row
        .map((cell) => {
          const value = String(cell);
          return `"${(/^[=+@\-\t\r]/.test(value) ? "'" : "") + value.replaceAll('"', '""')}"`;
        })
        .join(","),
    )
    .join("\r\n");
  const url = URL.createObjectURL(
    new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" }),
  );
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
