import { useState, type FormEvent } from "react";
import { ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { Button, Field, Modal } from "../../components/ui";
import { useWorkspace } from "../../context/workspace";
import { CURRENT_TUTOR, DEMO_DATE, DEMO_NOW } from "../../data/seed";
import { hasClash, meetingDate, uid, visiblePeople } from "../../lib/utils";
import type { Meeting } from "../../types";

export function MeetingForm({
  id,
  studentId,
  close,
}: {
  id?: string;
  studentId?: string;
  close: () => void;
}) {
  const { data, commit } = useWorkspace();
  const existing = data.meetings.find((m) => m.id === id);
  const people = visiblePeople(data, "tutor").filter((p) => p.active);
  const [form, setForm] = useState<Meeting>(
    existing ?? {
      id: uid(),
      title: "Personal tutoring check-in",
      studentId: studentId ?? people[0]?.id ?? "",
      tutorId: CURRENT_TUTOR,
      date: DEMO_DATE,
      time: "15:00",
      duration: 30,
      location: "Mercantile House · Room 2.14",
      kind: "in-person",
      required: true,
      status: "scheduled",
      attendance: "unrecorded",
    },
  );
  const [error, setError] = useState("");
  const change = <K extends keyof Meeting>(key: K, value: Meeting[K]) =>
    setForm((current) => ({ ...current, [key]: value }));
  function submit(event: FormEvent) {
    event.preventDefault();
    if (!form.studentId || !form.title.trim() || !form.location.trim())
      return setError(
        "Please complete the student, title and location fields.",
      );
    if (meetingDate(form) < DEMO_NOW)
      return setError(
        "Choose an appointment after 08:00 on 3 November 2026, the preview date.",
      );
    if (hasClash(data.meetings, form, id))
      return setError(
        "This time overlaps an existing student or tutor appointment. Please choose another slot.",
      );
    const moved =
      existing && (existing.date !== form.date || existing.time !== form.time);
    commit(
      (current) => ({
        ...current,
        meetings: moved
          ? [
              ...current.meetings.map((m) =>
                m.id === id ? { ...m, status: "superseded" as const } : m,
              ),
              { ...form, id: uid() },
            ]
          : existing
            ? current.meetings.map((m) => (m.id === id ? form : m))
            : [...current.meetings, form],
      }),
      existing ? "Updated a meeting" : "Scheduled a meeting",
    );
    toast.success(existing ? "Meeting updated" : "Meeting scheduled");
    close();
  }
  return (
    <Modal
      open
      onOpenChange={close}
      title={existing ? "Edit meeting" : "Make time for a check-in"}
      description="A small conversation can make a big difference."
    >
      <form onSubmit={submit} className="space-y-4">
        <Field label="Student">
          <select
            className="input"
            value={form.studentId}
            onChange={(e) => change("studentId", e.target.value)}
            required
          >
            {people.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Meeting title">
          <input
            className="input"
            value={form.title}
            onChange={(e) => change("title", e.target.value)}
            maxLength={120}
            required
          />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Date">
            <input
              className="input"
              type="date"
              min={DEMO_DATE}
              value={form.date}
              onChange={(e) => change("date", e.target.value)}
              required
            />
          </Field>
          <Field label="Start time · London">
            <input
              className="input"
              type="time"
              value={form.time}
              onChange={(e) => change("time", e.target.value)}
              required
            />
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Duration">
            <select
              className="input"
              value={form.duration}
              onChange={(e) => change("duration", Number(e.target.value))}
            >
              {[15, 30, 45, 60].map((n) => (
                <option key={n} value={n}>
                  {n} minutes
                </option>
              ))}
            </select>
          </Field>
          <Field label="Meeting format">
            <select
              className="input"
              value={form.kind}
              onChange={(e) =>
                change("kind", e.target.value as Meeting["kind"])
              }
            >
              <option value="in-person">In person</option>
              <option value="online">Online</option>
            </select>
          </Field>
        </div>
        <Field
          label={form.kind === "online" ? "Online meeting details" : "Location"}
        >
          <input
            className="input"
            value={form.location}
            onChange={(e) => change("location", e.target.value)}
            required
          />
        </Field>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            className="accent-brand"
            checked={form.required}
            onChange={(e) => change("required", e.target.checked)}
          />
          Required tutoring meeting
        </label>
        {error && (
          <p role="alert" className="form-error">
            {error}
          </p>
        )}
        <div className="dialog-actions">
          <Button type="button" variant="secondary" onClick={close}>
            Cancel
          </Button>
          <Button type="submit">
            {existing ? "Save changes" : "Schedule meeting"}
            <ArrowRight size={15} />
          </Button>
        </div>
      </form>
    </Modal>
  );
}
