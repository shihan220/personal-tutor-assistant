import { APP_ICON, APP_NAME } from "../lib/branding";

export function Brand({
  large = false,
  className = "",
}: {
  large?: boolean;
  className?: string;
}) {
  return (
    <span className={`flex min-w-0 items-center gap-3 ${className}`}>
      <img
        src={APP_ICON}
        alt=""
        width={512}
        height={512}
        className={`shrink-0 rounded-xl bg-white object-contain ${large ? "size-16" : "size-11"}`}
      />
      <span
        className={`min-w-0 max-w-[14ch] font-heading font-bold tracking-tight ${large ? "text-[23px] leading-tight sm:text-[28px]" : "text-[15px] leading-snug"}`}
      >
        {APP_NAME}
      </span>
    </span>
  );
}
