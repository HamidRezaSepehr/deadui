"use client";

import { useId, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

export type GooeyDirection = "top" | "bottom" | "left" | "right" | "radial";

export interface GooeyMenuItem {
  icon: React.ReactNode;
  href?: string;
  onClick?: () => void;
  label?: string;
}

export interface GooeyMenuProps {
  items: GooeyMenuItem[];
  direction?: GooeyDirection;
  mainIcon?: React.ReactNode;
  className?: string;
  /**
   * Animation speed multiplier. `1` is the default; higher values make the
   * satellites snap in faster (stiffer spring, shorter stagger). Default: 1
   */
  speed?: number;
  /**
   * Distance in pixels between consecutive satellites (and between the button
   * and the first satellite). Default: 80
   */
  distance?: number;
}

function getItemOffset(index: number, total: number, direction: GooeyDirection, distance: number) {
  if (direction === "top") return { x: 0, y: -(index + 1) * distance };
  if (direction === "bottom") return { x: 0, y: (index + 1) * distance };
  if (direction === "left") return { x: -(index + 1) * distance, y: 0 };
  if (direction === "right") return { x: (index + 1) * distance, y: 0 };
  if (direction === "radial") {
    const angle = (index / total) * 2 * Math.PI - Math.PI / 2;
    return { x: Math.cos(angle) * distance, y: Math.sin(angle) * distance };
  }
  return { x: 0, y: 0 };
}

/**
 * Gooey Menu.
 *
 * The main button and the satellite items are rendered inside a container that
 * carries an SVG `feGaussianBlur` + `feColorMatrix` filter. The blur smears
 * the alpha of both layers together and the color matrix re-thresholds it, so
 * the items appear to be connected to the button by a liquid bridge while they
 * travel. Framer Motion springs drive the positions, which is what makes the
 * bridge stretch and snap organically.
 */
export function GooeyMenu({
  items,
  direction = "top",
  mainIcon = <span>+</span>,
  className,
  speed = 1,
  distance = 80,
}: GooeyMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const reduceMotion = useReducedMotion();
  const filterId = `gooey-filter-menu-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;

  // Clamp to a sane range so a stray `0` or negative value can't freeze the
  // animation or invert the stagger order.
  const safeSpeed = Math.max(speed, 0.1);
  const safeDistance = Math.max(distance, 0);

  const transition = (index: number) =>
    reduceMotion
      ? { duration: 0 }
      : {
          type: "spring" as const,
          stiffness: 200 * safeSpeed,
          damping: 15,
          delay: (index * 0.05) / safeSpeed,
        };

  return (
    <div className={cn("relative flex items-center justify-center", className)}>
      <svg className="absolute h-0 w-0 pointer-events-none" aria-hidden="true" focusable="false">
        <defs>
          <filter id={filterId}>
            <feGaussianBlur in="SourceGraphic" stdDeviation="10" result="blur" />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7"
              result="gooey"
            />
            <feComposite in="SourceGraphic" in2="gooey" operator="atop" />
          </filter>
        </defs>
      </svg>

      <div className="relative" style={{ filter: `url(#${filterId})` }}>
        <motion.button
          type="button"
          onClick={() => setIsOpen((open) => !open)}
          aria-expanded={isOpen}
          aria-label={isOpen ? "Close menu" : "Open menu"}
          className="relative z-10 flex h-14 w-14 items-center justify-center rounded-full bg-dead-red text-white shadow-lg"
          animate={{ rotate: reduceMotion ? 0 : (isOpen ? 135 : 0) }}
          transition={{ type: "spring", stiffness: 260 * safeSpeed, damping: 20 }}
        >
          {mainIcon}
        </motion.button>

        <AnimatePresence>
          {isOpen &&
            items.map((item, index) => {
              const offset = getItemOffset(index, items.length, direction, safeDistance);
              const commonProps = {
                initial: { x: 0, y: 0, opacity: 0, scale: 0 },
                animate: { x: offset.x, y: offset.y, opacity: 1, scale: 1 },
                exit: { x: 0, y: 0, opacity: 0, scale: 0 },
                transition: transition(index),
                title: item.label,
                "aria-label": item.label,
                className:
                  "absolute left-0 top-0 z-0 flex h-12 w-12 items-center justify-center rounded-full bg-dead-red text-white shadow-md",
              };
              if (item.href) {
                return (
                  <motion.a key={index} href={item.href} onClick={item.onClick} {...commonProps}>
                    {item.icon}
                  </motion.a>
                );
              }
              return (
                <motion.button key={index} type="button" onClick={item.onClick} {...commonProps}>
                  {item.icon}
                </motion.button>
              );
            })}
        </AnimatePresence>
      </div>
    </div>
  );
}
