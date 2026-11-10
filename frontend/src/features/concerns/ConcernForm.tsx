import { useState, type FormEvent } from "react";
import { Plus, ShieldCheck, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Badge, Button, Field, Modal } from "../../components/ui";
import { useWorkspace } from "../../context/workspace";
import { CURRENT_STUDENT } from "../../data/seed";
import { fullDate, uid, visiblePeople } from "../../lib/utils";
import type { Concern } from "../../types";

export function ConcernForm({
  id,
  studentId,
  close,
}: {
  id?: string;
  studentId?: string;
  close: () => void;
}) {
  const { data, role, commit } = useWorkspace();
  const existing = data.concerns.find((c) => c.id === id);
  const [form, setForm] = useState<Concern>(
    existing ?? {
      id: uid(),
      studentId: studentId ?? visiblePeople(data, role)[0]?.id ?? "",
      title: "",
      category: "Academic support",
      status: "awaiting_review",
      owner: "Alex Morgan",
      dueDate: "2026-11-06",
      summary: "",
      studentSummary: "",
      actions: [],
      timeline: [],
    },
  );
  const [action, setAction] = useState("");
  const [error, setError] = useState("");
  const canManage = role === "officer";
  const person = data.people.find((p) => p.id === form.studentId);
  function submit(e: FormEvent) {
    e.preventDefault();
    if (!form.title.trim() || !form.studentId) return;
    if (form.status === "resolved" && form.actions.some((a) => !a.done))
      return setError(
        "Complete the outstanding actions before resolving this follow-up.",
      );
    if (!canManage && existing) return;
    commit(
      (c) => ({
        ...c,
        concerns: existing
          ? c.concerns.map((item) =>
              item.id === id
                ? {
                    ...form,
                    timeline: [
                      ...form.timeline,
                      {
                        id: uid(),
                        text: `Follow-up updated by ${data.profiles[role].name}.`,
                        date: new Date().toISOString(),
                      },
                    ],
                  }
                : item,
            )
          : [form, ...c.concerns],
      }),
      existing ? "Updated a follow-up" : "Raised a concern for officer review",
    );
    toast.success(
      existing ? "Follow-up updated" : "Concern added for officer review",
    );
    close();
  }
  return (
    <Modal
      open
      wide
      onOpenChange={close}
      title={existing ? form.title : "Make a supportive next step"}
      description={
        person
          ? `${person.name} · ${form.category}`
          : "Raise a concern so the right person can follow up."
      }
    >
      <form onSubmit={submit} className="space-y-4">
        {!existing && (
          <>
            <Field label="Student">
              <select
                className="input"
                value={form.studentId}
                onChange={(e) =>
                  setForm({ ...form, studentId: e.target.value })
                }
              >
                {visiblePeople(data, role).map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Concern title">
              <input
                className="input"
                required
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                maxLength={150}
              />
            </Field>
            <Field label="Category">
              <select
                className="input"
                value={form.category}
                onChange={(e) =>
                  setForm({
                    ...form,
                    category: e.target.value as Concern["category"],
                  })
                }
              >
                <option>Academic support</option>
                <option>Attendance</option>
              </select>
            </Field>
          </>
        )}
        {existing && (
          <div className="flex items-center justify-between">
            <Badge value={form.status} />
            <span className="text-xs text-muted">Owner: {form.owner}</span>
          </div>
        )}
        {(canManage || !existing) && (
          <Field
            label="Officer-only summary"
            hint="Use only necessary facts. Shared meeting notes are never copied here automatically."
          >
            <textarea
              className="input min-h-24"
              required
              value={form.summary}
              onChange={(e) => setForm({ ...form, summary: e.target.value })}
            />
          </Field>
        )}
        {canManage && (
          <>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Status">
                <select
                  className="input"
                  value={form.status}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      status: e.target.value as Concern["status"],
                    })
                  }
                >
                  <option value="awaiting_review">Needs review</option>
                  <option value="in_progress">In progress</option>
                  <option value="escalated">Escalated</option>
                  <option value="resolved">Resolved</option>
                </select>
              </Field>
              <Field label="Next action due">
                <input
                  type="date"
                  className="input"
                  required
                  value={form.dueDate}
                  onChange={(e) =>
                    setForm({ ...form, dueDate: e.target.value })
                  }
                />
              </Field>
            </div>
            <Field label="Responsible officer">
              <select
                className="input"
                value={form.owner}
                onChange={(e) => setForm({ ...form, owner: e.target.value })}
              >
                {data.staff
                  .filter(
                    (s) => s.role === "officer" && s.active && s.cohort === "A",
                  )
                  .map((s) => (
                    <option key={s.id}>{s.name}</option>
                  ))}
              </select>
            </Field>
            <div>
              <p className="mb-3 text-sm font-semibold">Follow-up actions</p>
              <div className="space-y-2">
                {form.actions.map((a) => (
                  <label
                    key={a.id}
                    className="flex items-center gap-3 rounded-lg border border-line p-3 text-sm"
                  >
                    <input
                      type="checkbox"
                      checked={a.done}
                      className="accent-brand"
                      onChange={(e) =>
                        setForm({
                          ...form,
                          actions: form.actions.map((item) =>
                            item.id === a.id
                              ? { ...item, done: e.target.checked }
                              : item,
                          ),
                        })
                      }
                    />
                    <span className={a.done ? "text-muted line-through" : ""}>
                      {a.text}
                    </span>
                    <button
                      type="button"
                      className="ml-auto text-muted hover:text-red-600"
                      aria-label={`Remove action: ${a.text}`}
                      onClick={() =>
                        setForm({
                          ...form,
                          actions: form.actions.filter(
                            (item) => item.id !== a.id,
                          ),
                        })
                      }
                    >
                      <Trash2 size={14} />
                    </button>
                  </label>
                ))}
              </div>
              <div className="mt-3 flex gap-2">
                <input
                  aria-label="New follow-up action"
                  className="input"
                  placeholder="Add a practical next step…"
                  value={action}
                  onChange={(e) => setAction(e.target.value)}
                />
                <Button
                  type="button"
                  variant="secondary"
                  aria-label="Add action"
                  disabled={!action.trim()}
                  onClick={() => {
                    setForm({
                      ...form,
                      actions: [
                        ...form.actions,
                        { id: uid(), text: action.trim(), done: false },
                      ],
                    });
                    setAction("");
                  }}
                >
                  <Plus size={17} />
                </Button>
              </div>
            </div>
          </>
        )}
        {existing && !canManage && (
          <div className="info-box">
            <ShieldCheck size={18} className="shrink-0" />
            <p>
              You can see the follow-up status and released support plan.
              Officer-only case notes stay restricted.
            </p>
          </div>
        )}
        {(canManage || form.studentSummary) && (
          <Field
            label={
              canManage
                ? "Student-facing support summary"
                : "Shared support plan"
            }
            hint={
              canManage
                ? "This is the only case narrative shared with the student and current tutor."
                : undefined
            }
          >
            <textarea
              className="input min-h-28 leading-6"
              readOnly={!canManage}
              value={form.studentSummary}
              onChange={(e) =>
                setForm({ ...form, studentSummary: e.target.value })
              }
              placeholder="Write an encouraging message with clear next steps…"
            />
          </Field>
        )}
        {canManage && existing && (
          <Button
            type="button"
            variant="secondary"
            disabled={!form.studentSummary.trim()}
            onClick={() => {
              commit(
                (c) => ({
                  ...c,
                  concerns: c.concerns.map((item) =>
                    item.id === id
                      ? { ...item, studentSummary: form.studentSummary }
                      : item,
                  ),
                  notifications:
                    form.studentId === CURRENT_STUDENT
                      ? [
                          {
                            id: uid(),
                            title: "A supportive next step",
                            body: form.studentSummary,
                            role: "student" as const,
                            read: false,
                            date: new Date().toISOString(),
                            path: "/follow-ups",
                          },
                          ...c.notifications,
                        ]
                      : c.notifications,
                }),
                "Released a student-facing support summary",
              );
              toast.success("Support summary released in the preview");
            }}
          >
            Release support summary
          </Button>
        )}
        {canManage && existing && form.timeline.length > 0 && (
          <div className="border-t border-line pt-4">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted">
              Activity
            </p>
            {form.timeline.map((t) => (
              <p key={t.id} className="mb-2 text-xs leading-5 text-muted">
                {fullDate(t.date)} · {t.text}
              </p>
            ))}
          </div>
        )}
        {error && (
          <p role="alert" className="form-error">
            {error}
          </p>
        )}
        <div className="dialog-actions">
          <Button type="button" variant="secondary" onClick={close}>
            Close
          </Button>
          {(canManage || !existing) && (
            <Button type="submit">
              {existing ? "Save follow-up" : "Raise concern"}
            </Button>
          )}
        </div>
      </form>
    </Modal>
  );
}
