import React from "react";

interface GameButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  color?: "green" | "blue" | "orange" | "red" | "purple" | "gold" | "gray";
  size?: "sm" | "md" | "lg";
}

export const GameButton = React.forwardRef<HTMLButtonElement, GameButtonProps>(({
  children,
  color = "blue",
  size = "md",
  className = "",
  ...props
}, ref) => {
  const colorMap = {
    green:
      "bg-[var(--color-game-green)] shadow-[0_4px_0_var(--color-game-green-dark)]",
    blue: "bg-[var(--color-game-blue)] shadow-[0_4px_0_var(--color-game-blue-dark)] text-white",
    orange:
      "bg-[var(--color-game-orange)] shadow-[0_4px_0_var(--color-game-orange-dark)] text-white",
    red: "bg-[var(--color-game-red)] shadow-[0_4_0_var(--color-game-red-dark)] text-white",
    purple:
      "bg-[var(--color-game-purple)] shadow-[0_4px_0_var(--color-game-purple-dark)] text-white",
    gold: "bg-[var(--color-game-gold)] shadow-[0_4px_0_var(--color-game-gold-dark)] text-white",
    gray: "bg-zinc-200 dark:bg-zinc-700 shadow-[0_4px_0_#cbd5e1] dark:shadow-[0_4px_0_#3f3f46] text-zinc-600 dark:text-zinc-200",
  };

  const sizeMap = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg",
  };

  return (
    <button
      className={`
        ${colorMap[color]} 
        ${sizeMap[size]}
        rounded-2xl font-black uppercase tracking-widest transition-all 
        active:translate-y-1 active:shadow-none hover:brightness-110 disabled:opacity-50 
        disabled:cursor-not-allowed flex items-center justify-center gap-2
        ${className}
      `}
      {...props}
      ref={ref}
    >
      {children}
    </button>
  );
});

GameButton.displayName = "GameButton";
