import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Button, Field, Modal } from "../../components/ui";
import { useWorkspace } from "../../context/workspace";
import { ROLE_LABELS } from "../../data/seed";
import { uid } from "../../lib/utils";
import type { Person, Role, StaffAccount } from "../../types";

export function AccountForm({ id, close }: { id?: string; close: () => void }) {
  const { data, commit } = useWorkspace();
  const person = data.people.find((p) => p.id === id);
  const staff = data.staff.find((p) => p.id === id);
  const [kind, setKind] = useState<Role>(staff?.role ?? "student");
  const [form, setForm] = useState({
    name: person?.name ?? staff?.name ?? "",
    email: person?.email ?? staff?.email ?? "",
    course: person?.course ?? "Computer Science",
    year: person?.year ?? 1,
    cohort: person?.cohort ?? staff?.cohort ?? "A",
    tutorId: person?.tutorId ?? "t1",
    active: person?.active ?? staff?.active ?? true,
  });
  const [error, setError] = useState("");
  const self = id === "staff-admin";
  function submit(e: FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) return;
    if (
      [...data.people, ...data.staff].some(
        (p) =>
          p.email.toLowerCase() === form.email.trim().toLowerCase() &&
          p.id !== id,
      )
    )
      return setError("An account with this email address already exists.");
    if (kind === "student") {
      const value: Person = {
        ...form,
        id: id ?? uid(),
        color: person?.color ?? "lilac",
      };
      commit(
        (c) => ({
          ...c,
          people: person
            ? c.people.map((p) => (p.id === id ? value : p))
            : [...c.people, value],
        }),
        person
          ? "Updated a student account or tutor assignment"
          : "Created a student account",
      );
    } else {
      const value: StaffAccount = {
        id: id ?? `staff-${uid()}`,
        name: form.name,
        email: form.email,
        role: kind,
        cohort: form.cohort,
        active: form.active,
      };
      commit(
        (c) => ({
          ...c,
          staff: staff
            ? c.staff.map((s) => (s.id === id ? value : s))
            : [...c.staff, value],
          tutors:
            kind === "tutor"
              ? staff
                ? c.tutors.map((t) =>
                    t.id === id?.replace("staff-", "")
                      ? { ...t, name: form.name, email: form.email }
                      : t,
                  )
                : [
                    ...c.tutors,
                    {
                      id: value.id.replace("staff-", ""),
                      name: value.name,
                      email: value.email,
                    },
                  ]
              : c.tutors,
        }),
        staff ? "Updated a staff account" : "Created a staff account",
      );
    }
    toast.success(id ? "Account updated" : "Account added to the preview");
    close();
  }
  return (
    <Modal
      open
      onOpenChange={close}
      title={id ? "Edit account" : "Welcome someone to the workspace"}
      description="Manage account details and academic assignments."
    >
      <form className="space-y-4" onSubmit={submit}>
        {!id && (
          <Field label="Account role">
            <select
              className="input"
              value={kind}
              onChange={(e) => setKind(e.target.value as Role)}
            >
              {Object.entries(ROLE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </Field>
        )}
        <Field label="Full name">
          <input
            className="input"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
            maxLength={100}
          />
        </Field>
        <Field label="Email address">
          <input
            type="email"
            className="input"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />
        </Field>
        {kind === "student" && (
          <>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Course">
                <select
                  className="input"
                  value={form.course}
                  onChange={(e) => setForm({ ...form, course: e.target.value })}
                >
                  {[
                    "Computer Science",
                    "Software Engineering",
                    "Cyber Security",
                  ].map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </Field>
              <Field label="Year">
                <select
                  className="input"
                  value={form.year}
                  onChange={(e) =>
                    setForm({ ...form, year: Number(e.target.value) })
                  }
                >
                  {[1, 2, 3].map((n) => (
                    <option key={n} value={n}>
                      Year {n}
                    </option>
                  ))}
                </select>
              </Field>
            </div>
            <Field label="Personal tutor">
              <select
                className="input"
                value={form.tutorId}
                onChange={(e) => setForm({ ...form, tutorId: e.target.value })}
              >
                {data.tutors.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </Field>
          </>
        )}
        <Field label="Cohort">
          <select
            className="input"
            value={form.cohort}
            onChange={(e) => setForm({ ...form, cohort: e.target.value })}
            disabled={self}
          >
            <option>A</option>
            <option>B</option>
            {kind === "admin" && <option>All</option>}
          </select>
        </Field>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.active}
            disabled={self}
            onChange={(e) => setForm({ ...form, active: e.target.checked })}
            className="accent-brand"
          />
          Active account
        </label>
        {self && (
          <p className="text-xs text-muted">
            Your own role, scope and active status require a different
            administrator.
          </p>
        )}
        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}
        <div className="dialog-actions">
          <Button variant="secondary" type="button" onClick={close}>
            Cancel
          </Button>
          <Button type="submit">
            {id ? "Save account" : "Create account"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
