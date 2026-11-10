import type { ReactNode } from "react";
export function PageHeading({
  eyebrow = "YOUR WORKSPACE",
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="page-heading">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h1 className="mt-2 font-heading text-[28px] font-bold leading-tight tracking-[-1px] sm:text-[32px]">
          {title}
        </h1>
        <p className="mt-2 text-[13px] leading-6 text-muted sm:text-sm">
          {description}
        </p>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
