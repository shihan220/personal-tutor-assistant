import { useEffect, useRef, useState, type ReactNode } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Bell,
  ChevronDown,
  ChevronRight,
  GraduationCap,
  HelpCircle,
  Menu,
  PanelLeftClose,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { useWorkspace } from "../context/workspace";
import { useDialogs } from "../context/dialogs";
import { ROLE_LABELS } from "../data/seed";
import { fullDate, visibleMeetings, visiblePeople } from "../lib/utils";
import { Avatar, Button, EmptyState, Modal } from "./ui";
import type { Role } from "../types";
import { navigation } from "../data/navigation";
import { APP_NAME } from "../lib/branding";
import { Brand } from "./Brand";

export function AppShell({ children }: { children: ReactNode }) {
  const { data, role, setRole } = useWorkspace();
  const { open } = useDialogs();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const sidebarRef = useRef<HTMLElement>(null);
  useEffect(() => {
    if (!mobileOpen || window.innerWidth >= 1024) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const links = () =>
      Array.from(
        sidebarRef.current?.querySelectorAll<HTMLElement>(
          "a[href], button:not(:disabled)",
        ) ?? [],
      ).filter((element) => element.getClientRects().length > 0);
    links()[0]?.focus();
    const trapFocus = (event: KeyboardEvent) => {
      if (event.key !== "Tab") return;
      const targets = links();
      const first = targets[0];
      const last = targets[targets.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    };
    document.addEventListener("keydown", trapFocus);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", trapFocus);
      document
        .querySelector<HTMLButtonElement>(
          'button[aria-label="Open navigation"]',
        )
        ?.focus();
    };
  }, [mobileOpen]);
  const active =
    navigation[role].find((n) => n.path === location.pathname)?.label ??
    (location.pathname === "/notifications"
      ? "Notifications"
      : location.pathname === "/settings"
        ? "Settings"
        : "Workspace");
  const unread = data.notifications.filter(
    (n) => n.role === role && !n.read,
  ).length;
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen((v) => !v);
      }
      if (e.key === "Escape") setMobileOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);
  useEffect(() => {
    document.title = `${active} · ${APP_NAME}`;
    window.scrollTo({ top: 0 });
  }, [active]);
  return (
    <div className="min-h-screen bg-canvas text-ink">
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>
      {mobileOpen && (
        <button
          aria-label="Close navigation overlay"
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}
      <aside
        ref={sidebarRef}
        aria-label="Workspace navigation"
        className={`sidebar ${mobileOpen ? "visible translate-x-0" : "invisible -translate-x-full"} ${collapsed ? "lg:invisible lg:-translate-x-full" : "lg:visible lg:translate-x-0"}`}
      >
        <div className="px-6 pt-8">
          <Link
            to="/"
            aria-label={`${APP_NAME} home`}
            className="block text-white"
            onClick={() => setMobileOpen(false)}
          >
            <Brand />
          </Link>
          <p className="mt-2 pl-0.5 text-[10px] tracking-wide text-[#9c98a6]">
            A little more connected.
          </p>
        </div>
        <div className="mx-4 mt-8 flex items-center gap-3 rounded-xl border border-white/8 bg-white/4 px-3 py-3">
          <span className="flex size-8 items-center justify-center rounded-lg bg-white/7 text-[#c7c1d4]">
            <GraduationCap size={17} />
          </span>
          <div>
            <p className="text-[11px] font-medium text-[#e2dfe9]">
              School of Computing
            </p>
            <p className="mt-1 text-[9px] text-[#9c98a6]">
              Personal tutoring workspace
            </p>
          </div>
        </div>
        <div className="mt-8 px-4">
          <p className="mb-3 px-3 text-[9px] font-medium tracking-[1.6px] text-[#aaa2b7]">
            WORKSPACE
          </p>
          <nav className="space-y-1.5">
            {navigation[role].map(({ path, label, icon: Icon }) => (
              <NavLink
                key={path}
                to={path}
                end={path === "/"}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `sidebar-link ${isActive ? "active" : ""}`
                }
              >
                <Icon size={17} strokeWidth={1.65} />
                <span>{label}</span>
                {path === "/follow-ups" && role !== "student" && (
                  <span className="ml-auto rounded-md bg-white/8 px-1.5 py-0.5 text-[9px] text-[#d2cada]">
                    {
                      data.concerns.filter(
                        (c) =>
                          c.status !== "resolved" &&
                          visiblePeople(data, role).some(
                            (p) => p.id === c.studentId,
                          ),
                      ).length
                    }
                  </span>
                )}
              </NavLink>
            ))}
          </nav>
        </div>
        <div className="mt-auto px-4 pt-10">
          <div className="mb-5 rounded-xl border border-white/8 bg-[#2c2934] p-4">
            <Sparkles size={18} className="mb-3 text-[#c2b0ed]" />
            <p className="text-[11px] font-medium text-[#e9e4f1]">
              Good support starts small.
            </p>
            <p className="mt-2 text-[10px] leading-5 text-[#a7a1b3]">
              A check-in. A question. A moment to listen.
            </p>
            <button
              onClick={() => open({ type: "help" })}
              className="mt-3 inline-flex items-center gap-2 text-[10px] font-semibold text-[#d4c3f4]"
            >
              A little guidance
              <ArrowRight size={12} />
            </button>
          </div>
          <NavLink
            to="/notifications"
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              `sidebar-link ${isActive ? "active" : ""}`
            }
          >
            <Bell size={17} strokeWidth={1.65} />
            Notifications
            {unread > 0 && (
              <span className="ml-auto size-1.5 rounded-full bg-[#b9a7e7]" />
            )}
          </NavLink>
          <NavLink
            to="/settings"
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              `sidebar-link ${isActive ? "active" : ""}`
            }
          >
            <Settings size={17} strokeWidth={1.65} />
            Settings
          </NavLink>
          <div className="mt-5 flex items-center gap-3 border-t border-white/8 px-2 py-5">
            <Avatar name={data.profiles[role].name} size="sm" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[11px] font-medium text-[#e5dfed]">
                {data.profiles[role].name}
              </p>
              <p className="mt-1 text-[9px] text-[#9890a4]">
                {ROLE_LABELS[role]}
              </p>
            </div>
            <button
              aria-label="Open profile settings"
              className="text-[#a69ab5] hover:text-white"
              onClick={() => navigate("/settings")}
            >
              <ChevronRight size={15} />
            </button>
          </div>
        </div>
      </aside>
      <div
        inert={mobileOpen || undefined}
        className={`transition-[padding] duration-200 ${collapsed ? "" : "lg:pl-59.5"}`}
      >
        <header className="sticky top-0 z-30 flex h-19 items-center justify-between gap-3 border-b border-line bg-canvas/95 px-4 backdrop-blur-md sm:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <button
              className="icon-btn lg:hidden"
              aria-label="Open navigation"
              onClick={() => setMobileOpen(true)}
            >
              <Menu size={19} />
            </button>
            <button
              className="icon-btn hidden lg:flex"
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              onClick={() => setCollapsed(!collapsed)}
            >
              <PanelLeftClose size={17} />
            </button>
            <p className="hidden items-center gap-2.5 text-[11px] text-muted sm:flex">
              <span>Workspace</span>
              <ChevronRight size={12} />
              <span className="font-medium text-ink">{active}</span>
            </p>
          </div>
          <div className="flex items-center gap-2 sm:gap-5">
            <button
              aria-label="Search workspace"
              onClick={() => setSearchOpen(true)}
              className="flex items-center gap-2.5 text-muted"
            >
              <Search size={16} />
              <span className="hidden text-[11px] xl:inline">
                Search anything...
              </span>
              <kbd className="hidden rounded border border-line bg-white px-1.5 py-0.5 text-[9px] xl:inline">
                ⌘ K
              </kbd>
            </button>
            <div className="h-5 w-px bg-line" />
            <div className="flex items-center gap-2">
              <span className="hidden rounded border border-[#ddd6ed] bg-lavender px-1.5 py-0.5 text-[8px] font-bold tracking-wider text-brand sm:inline">
                PREVIEW
              </span>
              <div className="relative">
                <select
                  aria-label="Preview role"
                  value={role}
                  onChange={(e) => {
                    setRole(e.target.value as Role);
                    navigate("/");
                    setMobileOpen(false);
                  }}
                  className="cursor-pointer appearance-none bg-transparent py-2 pr-5 text-[11px] font-medium outline-none"
                >
                  <option value="tutor">Personal tutor</option>
                  <option value="student">Student</option>
                  <option value="officer">Student officer</option>
                  <option value="admin">Administrator</option>
                </select>
                <ChevronDown
                  size={11}
                  className="pointer-events-none absolute right-0 top-1/2 -translate-y-1/2 text-muted"
                />
              </div>
            </div>
            <button
              aria-label={`Notifications${unread ? `, ${unread} unread` : ""}`}
              onClick={() => navigate("/notifications")}
              className="icon-btn relative"
            >
              <Bell size={17} />
              {unread > 0 && (
                <span className="absolute right-2 top-1.5 size-1.5 rounded-full bg-brand ring-2 ring-canvas" />
              )}
            </button>
            <button
              aria-label="Open help"
              className="icon-btn hidden md:flex"
              onClick={() => open({ type: "help" })}
            >
              <HelpCircle size={17} />
            </button>
            <button
              aria-label="Your profile"
              onClick={() => navigate("/settings")}
              className="hidden sm:block"
            >
              <Avatar name={data.profiles[role].name} size="sm" />
            </button>
          </div>
        </header>
        <main
          id="main-content"
          className="mx-auto max-w-390 px-4 py-7 sm:px-8 sm:py-8 lg:px-9"
          key={role}
        >
          {children}
        </main>
      </div>
      <Modal
        open={searchOpen}
        onOpenChange={setSearchOpen}
        title="Find your next step"
        description="Search the records visible in your preview role."
      >
        <WorkspaceSearch close={() => setSearchOpen(false)} />
      </Modal>
    </div>
  );
}

function WorkspaceSearch({ close }: { close: () => void }) {
  const { data, role } = useWorkspace();
  const { open } = useDialogs();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const q = query.toLowerCase().trim();
  const people = visiblePeople(data, role);
  const ids = new Set(people.map((p) => p.id));
  const results = q
    ? [
        ...people
          .filter((p) => p.name.toLowerCase().includes(q))
          .map((p) => ({
            id: p.id,
            title: p.name,
            detail: p.course,
            action: () => open({ type: "person", id: p.id }),
          })),
        ...visibleMeetings(data, role)
          .filter((m) => m.title.toLowerCase().includes(q))
          .slice(0, 4)
          .map((m) => ({
            id: m.id,
            title: m.title,
            detail: fullDate(m.date),
            action: () => open({ type: "meeting", id: m.id }),
          })),
        ...(["student", "tutor"].includes(role)
          ? data.notes
              .filter(
                (n) =>
                  ids.has(n.studentId) && n.title.toLowerCase().includes(q),
              )
              .map((n) => ({
                id: n.id,
                title: n.title,
                detail: "Shared note",
                action: () => open({ type: "note", id: n.id }),
              }))
          : []),
      ].slice(0, 8)
    : [];
  return (
    <div>
      <div className="relative">
        <Search size={17} className="absolute left-3.5 top-3.5 text-muted" />
        <input
          aria-label="Search people, meetings or notes"
          className="input pl-10"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Try a student name or a meeting topic…"
        />
      </div>
      {q ? (
        results.length ? (
          <div className="mt-4 space-y-1">
            {results.map((r) => (
              <button
                key={r.id}
                onClick={() => {
                  close();
                  r.action();
                }}
                className="flex w-full items-center justify-between rounded-lg p-3 text-left hover:bg-canvas"
              >
                <span>
                  <span className="block text-sm font-medium">{r.title}</span>
                  <span className="mt-1 block text-xs text-muted">
                    {r.detail}
                  </span>
                </span>
                <ArrowRight size={15} className="text-muted" />
              </button>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Search}
            title="Nothing by that name"
            description="Try a different name, meeting title, or note topic."
          />
        )
      ) : (
        <div className="mt-5 flex flex-wrap gap-2">
          {navigation[role].slice(1, 5).map((n) => (
            <Button
              key={n.path}
              variant="secondary"
              onClick={() => {
                close();
                navigate(n.path);
              }}
            >
              {n.label}
              <ArrowRight size={13} />
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}
export function AllowedPage({
  path,
  children,
}: {
  path: string;
  children: ReactNode;
}) {
  const { role } = useWorkspace();
  const navigate = useNavigate();
  return navigation[role].some((item) => item.path === path) ? (
    children
  ) : (
    <section className="panel">
      <EmptyState
        icon={ShieldCheck}
        title="This view belongs to another role"
        description="Use the preview role selector to explore a different workspace, or return to your overview."
        action={<Button onClick={() => navigate("/")}>Back to overview</Button>}
      />
    </section>
  );
}
export function NotFoundPage() {
  const navigate = useNavigate();
  return (
    <section className="panel">
      <EmptyState
        icon={Search}
        title="A little off the beaten path"
        description="We couldn’t find that page. Your workspace is just a click away."
        action={<Button onClick={() => navigate("/")}>Back to overview</Button>}
      />
    </section>
  );
}
