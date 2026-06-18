import { cn } from "@/lib/utils";

export function Spinner({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-block size-5 animate-spin rounded-full border-[3px] border-ink border-t-transparent",
        className,
      )}
    />
  );
}

export function EmptyState({
  title,
  description,
  action,
  className,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-card border-2 border-dashed border-ink bg-paper p-10 text-center",
        className,
      )}
    >
      <div className="mb-3 size-12 rounded-card border-2 border-ink bg-surface shadow-hard" />
      <p className="heading text-lg">{title}</p>
      {description && (
        <p className="mt-1.5 max-w-sm text-sm font-medium text-muted">
          {description}
        </p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
