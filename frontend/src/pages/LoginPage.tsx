import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  BookOpen,
  Eye,
  EyeOff,
  HeartHandshake,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";
import { useWorkspace } from "../context/workspace";
import { ROLE_LABELS } from "../data/seed";
import { Button, Field, Modal } from "../components/ui";
import type { Role } from "../types";

export function LoginPage() {
  const { data, setRole } = useWorkspace();
  const navigate = useNavigate();
  const [previewRole, setPreviewRole] = useState<Role>("tutor");
  const [email, setEmail] = useState(data.profiles.tutor.email);
  const [password, setPassword] = useState("preview-only");
  const [showPassword, setShowPassword] = useState(false);
  const [recovery, setRecovery] = useState(false);
  const [recoveryDone, setRecoveryDone] = useState(false);
  function submit(e: FormEvent) {
    e.preventDefault();
    setRole(previewRole);
    toast.success(`${ROLE_LABELS[previewRole]} preview opened`);
    navigate("/");
  }
  return (
    <main className="grid min-h-screen bg-white lg:grid-cols-2">
      <section className="relative hidden overflow-hidden bg-[#282330] p-14 lg:flex lg:flex-col xl:p-20">
        <div className="flex items-center gap-3 text-white">
          <span className="flex size-10 items-center justify-center rounded-xl bg-[#b6a4e8] text-[#25202f]">
            <BookOpen size={23} />
          </span>
          <span className="font-heading text-3xl font-bold tracking-tight">
            tutorly<span className="text-[#b6a4e8]">.</span>
          </span>
        </div>
        <div className="relative z-10 my-auto py-20">
          <span className="mb-8 flex size-14 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-[#cdb9ef]">
            <HeartHandshake size={28} />
          </span>
          <h1 className="max-w-lg font-heading text-5xl font-semibold leading-[1.2] tracking-[-2px] text-white xl:text-6xl">
            A little support.
            <br />
            <span className="text-[#c6b3e9]">A world of possibility.</span>
          </h1>
          <p className="mt-7 max-w-sm text-sm leading-8 text-[#b6afc0]">
            Good conversations help us find our feet. Make space for the
            check-ins, shared thoughts, and next steps that matter.
          </p>
          <div className="mt-10 flex items-center gap-3 text-xs text-[#d5cddd]">
            <span className="size-2 rounded-full bg-[#c6b3e9]" />
            One conversation at a time.
          </div>
        </div>
        <div className="absolute -right-34 bottom-0 size-100 rounded-full border border-white/5" />
        <div className="absolute -right-18 bottom-16 size-68 rounded-full border border-white/6" />
        <p className="relative z-10 text-[10px] text-[#93899f]">
          Personal tutoring, thoughtfully connected.
        </p>
      </section>
      <section className="flex items-center justify-center p-6 py-14 sm:p-12">
        <div className="w-full max-w-95">
          <div className="mb-12 flex items-center gap-2 text-brand lg:hidden">
            <BookOpen size={26} />
            <span className="font-heading text-2xl font-bold">tutorly.</span>
          </div>
          <p className="eyebrow">YOUR PERSONAL TUTORING WORKSPACE</p>
          <h2 className="mt-4 font-heading text-3xl font-bold tracking-tight">
            It’s good to see you.
          </h2>
          <p className="mt-3 text-sm leading-7 text-muted">
            A space to connect, reflect, and work out what’s next.
          </p>
          <form onSubmit={submit} className="mt-8 space-y-5">
            <Field label="Explore a workspace">
              <select
                className="input"
                value={previewRole}
                onChange={(e) => {
                  const role = e.target.value as Role;
                  setPreviewRole(role);
                  setEmail(data.profiles[role].email);
                }}
              >
                {Object.entries(ROLE_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Email address">
              <input
                type="email"
                autoComplete="off"
                className="input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </Field>
            <Field label="Preview password">
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  autoComplete="off"
                  className="input pr-11"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  aria-label={
                    showPassword
                      ? "Hide preview password"
                      : "Show preview password"
                  }
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute top-1/2 right-3 -translate-y-1/2 text-muted"
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </Field>
            <div className="flex justify-end">
              <button
                type="button"
                className="text-xs font-medium text-brand hover:underline"
                onClick={() => {
                  setRecoveryDone(false);
                  setRecovery(true);
                }}
              >
                Forgot your password?
              </button>
            </div>
            <Button type="submit" className="w-full">
              Enter design preview
              <ArrowRight size={16} />
            </Button>
          </form>
          <div className="mt-6 flex items-start gap-2.5 rounded-xl bg-lavender p-4">
            <ShieldCheck size={17} className="mt-0.5 shrink-0 text-brand" />
            <p className="text-[11px] leading-6 text-muted">
              Fictional accounts, browser-only preview. Any preview password
              works. Please don’t enter a real password.
            </p>
          </div>
          <button
            className="mt-8 w-full text-center text-xs text-muted hover:text-brand"
            onClick={() => navigate("/")}
          >
            Back to the workspace
          </button>
        </div>
      </section>
      <Modal
        open={recovery}
        onOpenChange={setRecovery}
        title={
          recoveryDone ? "Recovery screen preview" : "Let’s get you back in"
        }
        description={
          recoveryDone
            ? "This is the confirmation state for the password-recovery design."
            : "Enter the email address associated with your account."
        }
      >
        {recoveryDone ? (
          <div>
            <p className="text-sm leading-7 text-muted">
              If an account matches this address, recovery instructions would be
              sent. This design preview doesn’t send email or change passwords.
            </p>
            <Button className="mt-6 w-full" onClick={() => setRecovery(false)}>
              Back to sign in
            </Button>
          </div>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setRecoveryDone(true);
            }}
            className="space-y-5"
          >
            <Field label="Account email address">
              <input
                type="email"
                className="input"
                defaultValue={email}
                required
              />
            </Field>
            <Button className="w-full" type="submit">
              Preview recovery confirmation
            </Button>
          </form>
        )}
      </Modal>
    </main>
  );
}
