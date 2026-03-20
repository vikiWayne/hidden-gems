import type { ReactNode } from "react";

interface BannerBaseProps {
  title: ReactNode;
  severity: "error" | "success" | "warning" | "info";
}

interface BannerWithChildrenProps extends BannerBaseProps {
  children: ReactNode;
}
const colors: Record<BannerBaseProps["severity"], string> = {
  error: "red",
  success: "green",
  warning: "yellow",
  info: "blue",
};

export const Banner = ({
  children,
  title,
  severity,
}: BannerWithChildrenProps) => {
  const color = colors[severity];

  return (
    <div
      className={`flex items-start gap-3 rounded-2xl border-2 border-${color}-500/50 bg-${color}-500/10 px-4 py-3`}
    >
      <div
        className={`h-2.5 w-2.5 mt-1 rounded-full bg-${color}-400 shrink-0`}
      />
      <div>
        <p
          className={`text-sm font-black uppercase tracking-wider text-${color}-300`}
        >
          {title}
        </p>
        {children}
      </div>
    </div>
  );
};
