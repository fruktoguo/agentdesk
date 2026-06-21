import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Info,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Icon } from "./icon";

type Variant = "success" | "error" | "warning" | "info";

const CONFIG: Record<
  Variant,
  {
    cls: string;
    icon: LucideIcon;
    live: "assertive" | "polite";
    role: "alert" | "status";
  }
> = {
  success: {
    cls: "bg-grass text-ink",
    icon: CheckCircle2,
    live: "polite",
    role: "status",
  },
  error: {
    cls: "bg-accent text-white",
    icon: AlertCircle,
    live: "assertive",
    role: "alert",
  },
  warning: {
    cls: "bg-sun text-ink",
    icon: AlertTriangle,
    live: "polite",
    role: "status",
  },
  info: { cls: "bg-sky text-white", icon: Info, live: "polite", role: "status" },
};

/**
 * 统一的成功/错误/警告/提示反馈条。
 * - error 用 role=alert（屏幕阅读器即时打断播报）
 * - 其余用 role=status / aria-live=polite（空闲时播报）
 * - 自带孟菲斯硬边 + 进入动效（toast-in）
 */
export function Alert({
  variant = "info",
  title,
  children,
  className,
  ...props
}: { variant?: Variant; title?: string } & React.HTMLAttributes<HTMLDivElement>) {
  const cfg = CONFIG[variant];
  return (
    <div
      role={cfg.role}
      aria-live={cfg.live}
      className={cn(
        "flex items-start gap-2.5 border-2 border-ink px-3 py-2.5 text-sm font-bold shadow-hard-sm toast-in",
        cfg.cls,
        className,
      )}
      {...props}
    >
      <Icon icon={cfg.icon} size={18} className="mt-0.5" />
      <div className="min-w-0">
        {title && <p className="heading text-xs">{title}</p>}
        <div className={cn(title && "mt-0.5 font-medium")}>{children}</div>
      </div>
    </div>
  );
}
