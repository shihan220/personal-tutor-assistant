import * as Dialog from "@radix-ui/react-dialog";
import { ArrowRight, Check, Search, X, type LucideIcon } from "lucide-react";
import type {
  ButtonHTMLAttributes,
  InputHTMLAttributes,
  ReactNode,
} from "react";
import { initials, statusLabel } from "../lib/utils";

export function Button({
  variant = "primary",
  className = "",
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
}) {
  return (
    <button className={`btn btn-${variant} ${className}`} {...props}>
      {children}
    </button>
  );
}
export function IconButton({
  label,
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { label: string }) {
  return (
    <button title={label} aria-label={label} className="icon-btn" {...props}>
      {children}
    </button>
  );
}
export function Avatar({
  name,
  color = "lilac",
  size = "md",
}: {
  name: string;
  color?: string;
  size?: "sm" | "md" | "lg";
}) {
  return (
    <span
      aria-hidden="true"
      className={`avatar avatar-${color} ${size === "sm" ? "size-8 text-[11px]" : size === "lg" ? "size-12 text-base" : "size-10 text-xs"}`}
    >
      {initials(name)}
    </span>
  );
}
export function Badge({
  value,
  children,
}: {
  value: string;
  children?: ReactNode;
}) {
  return (
    <span
      className={`badge ${["present", "held", "resolved", "active", "healthy"].includes(value) ? "badge-green" : ["absent", "escalated", "inactive"].includes(value) ? "badge-red" : ["late", "awaiting_review", "attention", "unrecorded"].includes(value) ? "badge-amber" : "badge-purple"}`}
    >
      <span className="size-1.5 rounded-full bg-current" />
      {children ?? statusLabel(value)}
    </span>
  );
}
export function SearchField({
  placeholder = "Search…",
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="relative">
      <Search
        size={16}
        aria-hidden="true"
        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted"
      />
      <input
        aria-label={props["aria-label"] ?? placeholder}
        placeholder={placeholder}
        className="input pl-10"
        {...props}
      />
    </div>
  );
}
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center px-6 py-16 text-center">
      <div className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-lavender text-brand">
        <Icon size={23} />
      </div>
      <h3 className="font-semibold">{title}</h3>
      <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-muted">
        {description}
      </p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
export function Modal({
  open,
  onOpenChange,
  title,
  description,
  children,
  wide = false,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: ReactNode;
  wide?: boolean;
}) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="dialog-overlay" />
        <Dialog.Content
          className={`dialog-content ${wide ? "max-w-2xl" : "max-w-lg"}`}
        >
          <div className="flex items-start justify-between gap-5 border-b border-line px-6 py-5">
            <div>
              <Dialog.Title className="font-heading text-xl font-bold tracking-tight">
                {title}
              </Dialog.Title>
              <Dialog.Description className="mt-1.5 text-sm leading-6 text-muted">
                {description ?? "View and manage this item in your workspace."}
              </Dialog.Description>
            </div>
            <Dialog.Close
              aria-label="Close dialog"
              className="icon-btn shrink-0"
            >
              <X size={19} />
            </Dialog.Close>
          </div>
          <div className="px-6 py-5">{children}</div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
export function Field({
  label,
  children,
  hint,
}: {
  label: string;
  children: ReactNode;
  hint?: string;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-[13px] font-semibold text-ink">
        {label}
      </span>
      {children}
      {hint && (
        <span className="mt-1.5 block text-xs leading-5 text-muted">
          {hint}
        </span>
      )}
    </label>
  );
}
export function SectionHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
      <div>
        <h2 className="font-heading text-base font-bold tracking-tight">
          {title}
        </h2>
        {description && (
          <p className="mt-1 text-xs text-muted">{description}</p>
        )}
      </div>
      {action}
    </div>
  );
}
export function TextLink({
  children,
  onClick,
}: {
  children: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-2 text-xs font-semibold text-brand hover:text-brand-dark"
    >
      {children}
      <ArrowRight size={14} />
    </button>
  );
}
export function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${checked ? "bg-brand" : "bg-stone-300"}`}
    >
      <span
        className={`flex size-4.5 items-center justify-center rounded-full bg-white shadow-sm transition-transform ${checked ? "translate-x-6" : "translate-x-1"}`}
      >
        {checked && <Check size={11} className="text-brand" />}
      </span>
    </button>
  );
}
