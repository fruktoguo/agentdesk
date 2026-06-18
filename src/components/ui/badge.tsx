import { cn } from "@/lib/utils";

type BadgeColor =
  | "ink"
  | "yellow"
  | "blue"
  | "accent"
  | "grass"
  | "sun"
  | "muted"
  | "grape";

const colors: Record<BadgeColor, string> = {
  ink: "bg-ink text-white",
  yellow: "bg-surface text-ink",
  blue: "bg-sky text-white",
  accent: "bg-accent text-white",
  grass: "bg-grass text-ink",
  sun: "bg-sun text-ink",
  muted: "bg-paper text-muted",
  grape: "bg-grape text-white",
};

export function Badge({
  color = "ink",
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { color?: BadgeColor }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-pill border-2 border-ink px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide",
        colors[color],
        className,
      )}
      {...props}
    />
  );
}
