import { useState, type FormEvent } from "react";
import { ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { Button, Field, Modal } from "../../components/ui";
import { useWorkspace } from "../../context/workspace";
import { CURRENT_STUDENT } from "../../data/seed";
import { fullDate, uid, visiblePeople } from "../../lib/utils";
import type { Note } from "../../types";

export function NoteForm({
  id,
  studentId,
  close,
}: {
  id?: string;
  studentId?: string;
  close: () => void;
}) {
  const { data, role, commit } = useWorkspace();
  const existing = data.notes.find((n) => n.id === id);
  const [form, setForm] = useState({
    studentId:
      existing?.studentId ??
      studentId ??
      (role === "student"
        ? CURRENT_STUDENT
        : (visiblePeople(data, role)[0]?.id ?? "")),
    title: existing?.title ?? "",
    body: existing?.body ?? "",
    meetingId: existing?.meetingId ?? "",
  });
  const readOnly = existing && existing.authorRole !== role;
  const related = data.meetings.filter(
    (m) => m.studentId === form.studentId && m.status !== "cancelled",
  );
  function submit(e: FormEvent) {
    e.preventDefault();
    if (readOnly || !form.title.trim() || !form.body.trim()) return;
    const note: Note = {
      ...form,
      id: id ?? uid(),
      author: data.profiles[role].name,
      authorRole: role,
      createdAt: existing?.createdAt ?? new Date().toISOString(),
      revisions: (existing?.revisions ?? -1) + 1,
    };
    commit(
      (c) => ({
        ...c,
        notes: id
          ? c.notes.map((n) => (n.id === id ? note : n))
          : [note, ...c.notes],
      }),
      existing ? "Amended own shared note" : "Added a shared meeting note",
    );
    toast.success(
      existing ? "Your note has been updated" : "Shared note added",
    );
    close();
  }
  return (
    <Modal
      open
      onOpenChange={close}
      title={
        readOnly
          ? existing.title
          : existing
            ? "Edit your note"
            : "Keep the conversation going"
      }
      description={
        existing
          ? `By ${existing.author} · ${fullDate(existing.createdAt)}${existing.revisions ? ` · ${existing.revisions} revision(s)` : ""}`
          : "Capture a reflection, a question, or a helpful next step."
      }
    >
      <form onSubmit={submit} className="space-y-4">
        <div className="info-box">
          <ShieldCheck size={18} className="shrink-0" />
          <p>
            Shared with the student and their current personal tutor, including
            a replacement tutor.
          </p>
        </div>
        {!existing && role === "tutor" && (
          <Field label="Student">
            <select
              className="input"
              value={form.studentId}
              onChange={(e) =>
                setForm({ ...form, studentId: e.target.value, meetingId: "" })
              }
            >
              {visiblePeople(data, role).map((p) => (
                <option value={p.id} key={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </Field>
        )}
        <Field label="Related meeting">
          <select
            className="input"
            disabled={Boolean(readOnly)}
            value={form.meetingId}
            onChange={(e) => setForm({ ...form, meetingId: e.target.value })}
          >
            <option value="">General tutoring note</option>
            {related.map((m) => (
              <option key={m.id} value={m.id}>
                {fullDate(m.date)} · {m.title}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Title">
          <input
            className="input"
            value={form.title}
            readOnly={Boolean(readOnly)}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="Give your note a helpful title"
            maxLength={120}
            required
          />
        </Field>
        <Field label="Your note">
          <textarea
            className="input min-h-44 leading-7"
            value={form.body}
            readOnly={Boolean(readOnly)}
            onChange={(e) => setForm({ ...form, body: e.target.value })}
            placeholder="What would you like to remember or discuss?"
            maxLength={5000}
            required
          />
        </Field>
        <div className="dialog-actions">
          <Button type="button" variant="secondary" onClick={close}>
            {readOnly ? "Close" : "Cancel"}
          </Button>
          {!readOnly && (
            <Button type="submit">
              {existing ? "Save changes" : "Save shared note"}
            </Button>
          )}
        </div>
      </form>
    </Modal>
  );
}
