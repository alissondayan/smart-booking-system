import { cn } from "@/shared/lib/cn";

interface StatusBadgeProps {
  label: string;
  tone?: "neutral" | "success" | "warning" | "danger";
}

const toneClasses = {
  neutral: "bg-[var(--color-muted)] text-[var(--color-foreground)]",
  success: "bg-green-100 text-green-900",
  warning: "bg-amber-100 text-amber-900",
  danger: "bg-red-100 text-red-900",
};

export function StatusBadge({ label, tone = "neutral" }: StatusBadgeProps) {
  return <span className={cn("inline-flex rounded-full px-2.5 py-1 text-xs font-medium", toneClasses[tone])}>{label}</span>;
}
