import { useState } from "react";
import { toast } from "sonner";
import { Button, Field, Modal } from "../../components/ui";
import { useWorkspace } from "../../context/workspace";
import { CURRENT_STUDENT, DEMO_DATE, DEMO_NOW } from "../../data/seed";
import { meetingDate, uid } from "../../lib/utils";
import type { MeetingRequest } from "../../types";

export function RequestForm({ id, close }: { id?: string; close: () => void }) {
  const { data, commit } = useWorkspace();
  const meeting = data.meetings.find((m) => m.id === id);
  const past = meeting && meetingDate(meeting) < DEMO_NOW;
  const [form, setForm] = useState<MeetingRequest>({
    id: uid(),
    studentId: CURRENT_STUDENT,
    meetingId: id,
    title: meeting?.title ?? "Personal tutoring check-in",
    date: meeting?.date ?? "2026-11-04",
    time: meeting?.time ?? "15:00",
    reason: "",
    kind: past ? "correction" : meeting ? "reschedule" : "meeting",
    status: "pending",
    response: "",
  });
  return (
    <Modal
      open
      onOpenChange={close}
      title={
        past
          ? "Request an attendance correction"
          : meeting
            ? "Request a meeting change"
            : "Make time for a conversation"
      }
      description="Your request will be ready for review in this local preview."
    >
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          commit(
            (c) => ({
              ...c,
              requests: [form, ...c.requests],
              notifications: [
                {
                  id: uid(),
                  title:
                    form.kind === "correction"
                      ? "An attendance correction needs a review"
                      : "A student has requested a meeting",
                  body: `${data.people.find((p) => p.id === CURRENT_STUDENT)?.name} submitted a ${form.kind} request.`,
                  role: form.kind === "correction" ? "officer" : "tutor",
                  read: false,
                  date: new Date().toISOString(),
                  path:
                    form.kind === "correction" ? "/attendance" : "/meetings",
                },
                ...c.notifications,
              ],
            }),
            "Submitted a student request",
          );
          toast.success(
            "Request added. The confirmed record stays the same until review.",
          );
          close();
        }}
      >
        {meeting && !past && (
          <Field label="Type of change">
            <select
              className="input"
              value={form.kind}
              onChange={(e) =>
                setForm({
                  ...form,
                  kind: e.target.value as MeetingRequest["kind"],
                })
              }
            >
              <option value="reschedule">Reschedule meeting</option>
              <option value="cancel">Cancel meeting</option>
            </select>
          </Field>
        )}
        {!meeting && (
          <Field label="What would you like to discuss?">
            <input
              className="input"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
            />
          </Field>
        )}
        {!past && form.kind !== "cancel" && (
          <div className="grid grid-cols-2 gap-4">
            <Field label="Preferred date">
              <input
                className="input"
                type="date"
                value={form.date}
                min={DEMO_DATE}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                required
              />
            </Field>
            <Field label="Preferred time · London">
              <input
                className="input"
                type="time"
                value={form.time}
                onChange={(e) => setForm({ ...form, time: e.target.value })}
                required
              />
            </Field>
          </div>
        )}
        <Field
          label={
            past ? "What needs correcting?" : "Anything your tutor should know?"
          }
        >
          <textarea
            className="input min-h-28"
            value={form.reason}
            onChange={(e) => setForm({ ...form, reason: e.target.value })}
            placeholder={
              past
                ? "Explain what happened and the correction you are requesting."
                : "Share a little context for your request."
            }
            required
            maxLength={1000}
          />
        </Field>
        <div className="dialog-actions">
          <Button variant="secondary" type="button" onClick={close}>
            Cancel
          </Button>
          <Button type="submit">Submit request</Button>
        </div>
      </form>
    </Modal>
  );
}
