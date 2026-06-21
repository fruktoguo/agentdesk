import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const SIZE: Record<string, number> = {
  xs: 14,
  sm: 16,
  md: 20,
  lg: 24,
  xl: 32,
};

export interface IconProps extends React.SVGProps<SVGSVGElement> {
  icon: LucideIcon;
  size?: keyof typeof SIZE | number;
  strokeWidth?: number;
}

/**
 * 统一封装 lucide 图标：
 * - 孟菲斯粗描边（strokeWidth 2.25，比默认 2 更粗犷）
 * - 语义化尺寸 token
 * - 默认装饰（aria-hidden=true）；图标承载语义时，在父级可交互元素上给 aria-label，
 *   图标本身保持 aria-hidden 即可。
 */
export function Icon({
  icon: I,
  size = "md",
  strokeWidth = 2.25,
  className,
  ...props
}: IconProps) {
  const px = typeof size === "number" ? size : SIZE[size];
  return (
    <I
      aria-hidden
      size={px}
      strokeWidth={strokeWidth}
      className={cn("shrink-0", className)}
      {...props}
    />
  );
}
