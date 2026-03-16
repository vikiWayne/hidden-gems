/**
 * Pure UI - loading spinner. No business logic.
 */

interface SpinnerProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

const sizeClasses = {
  sm: "w-6 h-6 border-2",
  md: "w-8 h-8 border-4",
  lg: "w-12 h-12 border-4",
};

export function Spinner({ className = "", size = "md" }: SpinnerProps) {
  return (
    <div
      className={`border-[var(--color-game-purple)] border-t-transparent rounded-full animate-spin ${sizeClasses[size]} ${className}`}
      role="status"
      aria-label="Loading"
    />
  );
}
