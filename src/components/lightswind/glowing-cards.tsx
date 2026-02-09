"use client";

import React, { useEffect, useRef, useState } from "react";
import { cn } from "../../lib/utils";

export interface GlowingCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  glowColor?: string;
  hoverEffect?: boolean;
}

export interface GlowingCardsProps {
  children: React.ReactNode;
  className?: string;
  /** Enable the glowing overlay effect */
  enableGlow?: boolean;
  /** Size of the glow effect radius */
  glowRadius?: number;
  /** Opacity of the glow effect */
  glowOpacity?: number;
  /** Animation duration for glow transitions */
  animationDuration?: number;
  /** Enable hover effects on individual cards */
  enableHover?: boolean;
  /** Gap between cards */
  gap?: string;
  /** Maximum width of cards container */
  maxWidth?: string;
  /** Padding around the container */
  padding?: string;
  /** Background color for the container */
  backgroundColor?: string;
  /** Border radius for cards */
  borderRadius?: string;
  /** Enable responsive layout */
  responsive?: boolean;
  /** Custom CSS variables for theming */
  customTheme?: {
    cardBg?: string;
    cardBorder?: string;
    textColor?: string;
    hoverBg?: string;
  };
}

const isGlowingCardElement = (
  node: React.ReactNode,
): node is React.ReactElement<GlowingCardProps> => {
  return (
    React.isValidElement<GlowingCardProps>(node) && node.type === GlowingCard
  );
};

export const GlowingCard: React.FC<GlowingCardProps> = ({
  children,
  className,
  glowColor = "#3b82f6",
  hoverEffect = true,
  ...props
}) => {
  return (
    <div
      className={cn(
        "relative flex-1 min-w-[14rem] p-6 rounded-2xl text-black dark:text-white",
        "bg-background border",
        "transition-all duration-[400ms] ease-out",
        hoverEffect && "hover:-translate-y-0.5",
        className,
      )}
      style={
        {
          "--glow-color": glowColor,
          ...(props.style ?? {}),
        } as React.CSSProperties
      }
      {...props}
    >
      {children}
    </div>
  );
};

export const GlowingCards: React.FC<GlowingCardsProps> = ({
  children,
  className,
  enableGlow = true,
  glowRadius = 25,
  glowOpacity = 1,
  animationDuration = 400,
  enableHover = true,
  gap = "2.5rem",
  maxWidth = "75rem",
  padding = "3rem 1.5rem",
  backgroundColor,
  borderRadius = "1rem",
  responsive = true,
  customTheme,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const [showOverlay, setShowOverlay] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    const overlay = overlayRef.current;

    if (!container || !overlay || !enableGlow) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      setShowOverlay(true);

      overlay.style.setProperty("--x", `${x}px`);
      overlay.style.setProperty("--y", `${y}px`);
      overlay.style.setProperty("--opacity", glowOpacity.toString());
    };

    const handleMouseLeave = () => {
      setShowOverlay(false);
      overlay.style.setProperty("--opacity", "0");
    };

    container.addEventListener("mousemove", handleMouseMove);
    container.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      container.removeEventListener("mousemove", handleMouseMove);
      container.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [enableGlow, glowOpacity]);

  const containerStyle = {
    "--gap": gap,
    "--max-width": maxWidth,
    "--padding": padding,
    "--border-radius": borderRadius,
    "--animation-duration": `${animationDuration}ms`,
    "--glow-radius": `${glowRadius}rem`,
    "--glow-opacity": glowOpacity,
    backgroundColor: backgroundColor || undefined,

    // Optional theme vars
    ...(customTheme?.cardBg
      ? ({ "--card-bg": customTheme.cardBg } as React.CSSProperties)
      : {}),
    ...(customTheme?.cardBorder
      ? ({ "--card-border": customTheme.cardBorder } as React.CSSProperties)
      : {}),
    ...(customTheme?.textColor
      ? ({ "--card-text": customTheme.textColor } as React.CSSProperties)
      : {}),
    ...(customTheme?.hoverBg
      ? ({ "--card-hover-bg": customTheme.hoverBg } as React.CSSProperties)
      : {}),
  } as React.CSSProperties;

  return (
    <div className={cn("relative w-full", className)} style={containerStyle}>
      <div
        ref={containerRef}
        className={cn("relative max-w-[var(--max-width)] mx-auto", "px-6 py-2")}
        style={{ padding: "var(--padding)" }}
      >
        <div
          className={cn(
            "flex items-center justify-center flex-wrap gap-[var(--gap)]",
            responsive && "flex-col sm:flex-row",
          )}
        >
          {children}
        </div>

        {enableGlow && (
          <div
            ref={overlayRef}
            className={cn(
              "absolute inset-0 pointer-events-none select-none",
              "opacity-0 transition-all duration-[var(--animation-duration)] ease-out",
            )}
            style={{
              WebkitMask:
                "radial-gradient(var(--glow-radius) var(--glow-radius) at var(--x, 0) var(--y, 0), #000 1%, transparent 50%)",
              mask: "radial-gradient(var(--glow-radius) var(--glow-radius) at var(--x, 0) var(--y, 0), #000 1%, transparent 50%)",
              opacity: showOverlay ? "var(--opacity)" : "0",
            }}
          >
            <div
              className={cn(
                "flex items-center justify-center flex-wrap gap-[var(--gap)] max-w-[var(--max-width)] mx-auto",
                responsive && "flex-col sm:flex-row",
              )}
              style={{ padding: "var(--padding)" }}
            >
              {React.Children.map(children, (child) => {
                if (!isGlowingCardElement(child)) return child;

                const cardGlowColor = child.props.glowColor ?? "#3b82f6";
                const cardHoverEnabled =
                  enableHover && child.props.hoverEffect !== false;

                return React.cloneElement(child, {
                  className: cn(
                    child.props.className,
                    "bg-opacity-15 dark:bg-opacity-15",
                    "border-opacity-100 dark:border-opacity-100",
                    cardHoverEnabled && "transition-all duration-300",
                  ),
                  style: {
                    ...(child.props.style ?? {}),
                    backgroundColor: `${cardGlowColor}15`,
                    borderColor: cardGlowColor,
                    boxShadow: `0 0 0 1px inset ${cardGlowColor}`,
                  },
                });
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export { GlowingCards as default };
