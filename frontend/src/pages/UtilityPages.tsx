import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  Check,
  CheckCheck,
  ClipboardList,
  Download,
  Info,
  RotateCcw,
  Save,
  Settings2,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";
import { createSeed } from "../data/seed";
import { useWorkspace } from "../context/workspace";
import {
  attendanceFor,
  downloadCsv,
  fullDate,
  visiblePeople,
} from "../lib/utils";
import {
  Avatar,
  Button,
  EmptyState,
  Field,
  Modal,
  SearchField,
  SectionHeader,
  Toggle,
} from "../components/ui";
import { PageHeading } from "../components/PageHeading";

export function NotificationsPage() {
  const { data, role, commit } = useWorkspace();
  const navigate = useNavigate();
  const [unread, setUnread] = useState(false);
  const notices = data.notifications.filter(
    (n) => n.role === role && (!unread || !n.read),
  );
  return (
    <div className="animate-enter">
      <PageHeading
        title="A little nudge, at the right time"
        description="Your meetings, shared updates, and next steps, all together."
        action={
          <Button
            variant="secondary"
            onClick={() => {
              commit((c) => ({
                ...c,
                notifications: c.notifications.map((n) =>
                  n.role === role ? { ...n, read: true } : n,
                ),
              }));
              toast.success("All updates marked as read");
            }}
          >
            <CheckCheck size={16} />
            Mark all as read
          </Button>
        }
      />
      <section className="panel p-0!">
        <div className="flex gap-6 border-b border-line px-6">
          <button
            className={`nav-tab ${!unread ? "selected" : ""}`}
            onClick={() => setUnread(false)}
          >
            All updates
          </button>
          <button
            className={`nav-tab ${unread ? "selected" : ""}`}
            onClick={() => setUnread(true)}
          >
            Unread
          </button>
        </div>
        {notices.length ? (
          notices.map((n) => (
            <button
              key={n.id}
              onClick={() => {
                commit((c) => ({
                  ...c,
                  notifications: c.notifications.map((item) =>
                    item.id === n.id ? { ...item, read: true } : item,
                  ),
                }));
                navigate(n.path);
              }}
              className={`flex w-full items-start gap-4 border-b border-line px-6 py-6 text-left last:border-0 hover:bg-canvas ${!n.read ? "bg-lavender/20" : ""}`}
            >
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-lavender text-brand">
                <Bell size={18} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold">{n.title}</p>
                <p className="mt-1.5 text-xs leading-6 text-muted">{n.body}</p>
                <p className="mt-2 text-[10px] text-muted">
                  {fullDate(n.date, { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
              {!n.read && (
                <span className="mt-2 size-2 shrink-0 rounded-full bg-brand">
                  <span className="sr-only">Unread</span>
                </span>
              )}
            </button>
          ))
        ) : (
          <EmptyState
            icon={Bell}
            title="You’re all caught up"
            description="New updates will be here when you need them."
          />
        )}
      </section>
    </div>
  );
}

export function SettingsPage() {
  const navigate = useNavigate();
  const { data, role, commit, reset } = useWorkspace();
  const [profile, setProfile] = useState(data.profiles[role]);
  const [preferences, setPreferences] = useState(data.preferences[role]);
  const [confirm, setConfirm] = useState(false);
  function save(e: FormEvent) {
    e.preventDefault();
    if (!profile.name.trim()) return;
    commit(
      (c) => ({
        ...c,
        profiles: { ...c.profiles, [role]: profile },
        preferences: { ...c.preferences, [role]: preferences },
      }),
      "Updated own profile and notification preferences",
    );
    toast.success("Your preferences are saved");
  }
  return (
    <div className="animate-enter">
      <PageHeading
        title="Make this space yours"
        description="A few preferences to help your workspace work for you."
      />
      <form
        onSubmit={save}
        className="grid items-start gap-6 xl:grid-cols-[1.5fr_1fr]"
      >
        <section className="panel">
          <SectionHeader
            title="Your profile"
            description="How you appear in the tutoring workspace."
          />
          <div className="mb-7 flex items-center gap-4">
            <Avatar name={profile.name || "Your profile"} size="lg" />
            <div>
              <p className="text-sm font-semibold">{profile.name}</p>
              <p className="mt-1 text-xs text-muted">{profile.title}</p>
            </div>
          </div>
          <div className="space-y-5">
            <Field label="Full name">
              <input
                className="input"
                value={profile.name}
                onChange={(e) =>
                  setProfile({ ...profile, name: e.target.value })
                }
                required
                maxLength={100}
              />
            </Field>
            <Field label="Email address">
              <input
                className="input"
                type="email"
                value={profile.email}
                onChange={(e) =>
                  setProfile({ ...profile, email: e.target.value })
                }
                required
              />
            </Field>
            <Field label="Profile description">
              <input
                className="input"
                value={profile.title}
                onChange={(e) =>
                  setProfile({ ...profile, title: e.target.value })
                }
                maxLength={140}
              />
            </Field>
            <div className="border-t border-line pt-5">
              <Button type="submit">
                <Save size={16} />
                Save preferences
              </Button>
            </div>
          </div>
        </section>
        <div className="space-y-6">
          <section className="panel">
            <SectionHeader
              title="Keep me in the loop"
              description="Choose which updates are useful to you."
            />
            {(
              [
                [
                  "email",
                  "Email updates",
                  "Meeting changes and released support messages.",
                ],
                [
                  "reminders",
                  "Meeting reminders",
                  "A helpful nudge before your next check-in.",
                ],
                [
                  "digest",
                  "Weekly overview",
                  "A quiet summary of the week ahead.",
                ],
              ] as const
            ).map(([key, title, description]) => (
              <div
                className="flex items-center justify-between gap-4 border-b border-line py-4 first:pt-0 last:border-0 last:pb-0"
                key={key}
              >
                <div>
                  <p className="text-xs font-semibold">{title}</p>
                  <p className="mt-1 text-[11px] leading-5 text-muted">
                    {description}
                  </p>
                </div>
                <Toggle
                  label={title}
                  checked={preferences[key]}
                  onChange={(value) =>
                    setPreferences({ ...preferences, [key]: value })
                  }
                />
              </div>
            ))}
          </section>
          <section className="panel">
            <SectionHeader title="Design preview" />
            <Button
              type="button"
              variant="secondary"
              className="mb-4"
              onClick={() => navigate("/login")}
            >
              View sign-in design
            </Button>
            <p className="text-xs leading-6 text-muted">
              All people and records are fictional. Changes are stored only in
              this browser. Reset the sample workspace to explore the original
              design again.
            </p>
            <Button
              type="button"
              variant="secondary"
              className="mt-4"
              onClick={() => setConfirm(true)}
            >
              <RotateCcw size={15} />
              Reset sample data
            </Button>
          </section>
        </div>
      </form>
      <Modal
        open={confirm}
        onOpenChange={setConfirm}
        title="Start fresh?"
        description="This removes your local preview changes and restores the fictional sample workspace."
      >
        <div className="dialog-actions">
          <Button variant="secondary" onClick={() => setConfirm(false)}>
            Keep my changes
          </Button>
          <Button
            variant="danger"
            onClick={() => {
              reset();
              setConfirm(false);
              const seed = createSeed();
              setProfile(seed.profiles[role]);
              setPreferences(seed.preferences[role]);
            }}
          >
            Reset sample data
          </Button>
        </div>
      </Modal>
    </div>
  );
}

export function RulesPage() {
  const { data, commit } = useWorkspace();
  const [rules, setRules] = useState(data.rules);
  const [preview, setPreview] = useState(false);
  const affected = visiblePeople(data, "officer").filter((p) => {
    const a = attendanceFor(data.meetings, p.id);
    return (
      (a.percent !== null &&
        !a.unknown &&
        a.total >= rules.minimum &&
        a.percent < rules.threshold) ||
      a.consecutive >= rules.consecutive
    );
  });
  return (
    <div className="animate-enter">
      <PageHeading
        title="Clear rules. Thoughtful follow-up."
        description="Prototype attendance settings for cohort A · Teaching block 1."
      />
      <div className="info-box mb-6">
        <Info size={18} className="shrink-0" />
        <p>
          These are proposed prototype thresholds, not university policy. They
          suggest a supportive review; they never trigger disciplinary action.
        </p>
      </div>
      <section className="panel max-w-3xl">
        <SectionHeader
          title="When to suggest a check-in"
          description="Review the impact before updating your preview settings."
        />
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setPreview(true);
          }}
          className="space-y-5"
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <Field
              label="Attendance below (%)"
              hint="Exactly this percentage does not trigger a concern."
            >
              <input
                type="number"
                min="1"
                max="100"
                className="input"
                required
                value={rules.threshold}
                onChange={(e) =>
                  setRules({ ...rules, threshold: Number(e.target.value) })
                }
              />
            </Field>
            <Field
              label="Minimum confirmed outcomes"
              hint="Required before a percentage-based review."
            >
              <input
                type="number"
                min="1"
                max="50"
                className="input"
                required
                value={rules.minimum}
                onChange={(e) =>
                  setRules({ ...rules, minimum: Number(e.target.value) })
                }
              />
            </Field>
          </div>
          <Field
            label="Consecutive unexcused absences"
            hint="Applies independently of the percentage minimum."
          >
            <input
              type="number"
              min="1"
              max="10"
              className="input max-w-xs"
              required
              value={rules.consecutive}
              onChange={(e) =>
                setRules({ ...rules, consecutive: Number(e.target.value) })
              }
            />
          </Field>
          <div className="rounded-xl bg-canvas p-5">
            <h3 className="text-sm font-semibold">Keep the context</h3>
            <ul className="mt-3 space-y-2 text-xs leading-6 text-muted">
              <li>
                Cancelled, optional, excused and tutor-unavailable meetings are
                excluded.
              </li>
              <li>
                Unknown records pause percentage-based review suggestions.
              </li>
              <li>
                Present or late attendance breaks a consecutive-absence run.
              </li>
              <li>Teaching-block window: 28 September – 18 December 2026.</li>
            </ul>
          </div>
          <Button type="submit">
            <Settings2 size={16} />
            Preview impact
          </Button>
        </form>
      </section>
      <Modal
        open={preview}
        onOpenChange={setPreview}
        title="Review the impact"
        description="Your settings will update attendance indicators in this browser preview."
      >
        <p className="text-sm leading-7">
          <strong>{affected.length} students</strong> would meet the current
          preview criteria.
        </p>
        <div className="mt-4 space-y-2">
          {affected.map((p) => (
            <div
              key={p.id}
              className="flex items-center gap-3 rounded-lg bg-canvas p-3"
            >
              <Avatar name={p.name} color={p.color} size="sm" />
              <span className="text-sm">{p.name}</span>
            </div>
          ))}
        </div>
        <p className="mt-4 text-xs leading-6 text-muted">
          These settings update the preview indicators. Existing sample
          follow-ups remain available for you to explore.
        </p>
        <div className="dialog-actions">
          <Button variant="secondary" onClick={() => setPreview(false)}>
            Keep editing
          </Button>
          <Button
            onClick={() => {
              commit(
                (c) => ({ ...c, rules }),
                "Updated prototype attendance-rule preferences",
              );
              setPreview(false);
              toast.success("Preview attendance settings updated");
            }}
          >
            Apply to preview
          </Button>
        </div>
      </Modal>
    </div>
  );
}

export function AuditPage() {
  const { data } = useWorkspace();
  const [query, setQuery] = useState("");
  const events = data.audit.filter((a) =>
    `${a.actor} ${a.action}`.toLowerCase().includes(query.toLowerCase()),
  );
  return (
    <div className="animate-enter">
      <PageHeading
        title="A workspace with a clear history"
        description="Account and operational activity, without confidential meeting content."
        action={
          <Button
            variant="secondary"
            onClick={() =>
              downloadCsv("workspace-activity.csv", [
                ["Actor", "Activity", "Date"],
                ...events.map((e) => [e.actor, e.action, e.date]),
              ])
            }
          >
            <Download size={16} />
            Export activity
          </Button>
        }
      />
      <section className="panel">
        <div className="mb-5 max-w-sm">
          <SearchField
            placeholder="Search workspace activity"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        {events.length ? (
          <div className="space-y-0">
            {events.map((e) => (
              <div
                key={e.id}
                className="flex gap-4 border-b border-line py-5 last:border-0"
              >
                <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-lavender text-brand">
                  <ShieldCheck size={17} />
                </span>
                <div>
                  <p className="text-sm font-medium">{e.action}</p>
                  <p className="mt-1 text-xs text-muted">
                    {e.actor} ·{" "}
                    {fullDate(e.date, { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
                <Check size={15} className="ml-auto mt-1 text-emerald-600" />
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={ClipboardList}
            title="No matching activity"
            description="Try another actor or activity description."
          />
        )}
      </section>
    </div>
  );
}
