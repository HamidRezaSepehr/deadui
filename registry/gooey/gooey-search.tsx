"use client";

import { useId, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

export type GooeySearchDirection = "left" | "right" | "top" | "bottom";

export interface GooeySearchProps {
  direction?: GooeySearchDirection;
  placeholder?: string;
  className?: string;
  onSearch?: (value: string) => void;
}

const DISTANCE = 220;
const INPUT_WIDTH = "14rem";
const INPUT_HEIGHT = "3.5rem";

function getIconTransform(direction: GooeySearchDirection) {
  switch (direction) {
    case "left":
      return { x: -DISTANCE, y: 0 };
    case "right":
      return { x: DISTANCE, y: 0 };
    case "top":
      return { x: 0, y: -DISTANCE };
    case "bottom":
      return { x: 0, y: DISTANCE };
    default:
      return { x: DISTANCE, y: 0 };
  }
}

function getInputStyle(direction: GooeySearchDirection) {
  const base = {
    position: "absolute" as const,
    height: INPUT_HEIGHT,
    width: INPUT_WIDTH,
  };
  switch (direction) {
    case "left":
      return { ...base, left: "3.5rem", top: 0 };
    case "right":
      return { ...base, right: "3.5rem", top: 0 };
    case "top":
      return { ...base, top: "3.5rem", left: "50%", transform: "translateX(-50%)" };
    case "bottom":
      return { ...base, bottom: "3.5rem", left: "50%", transform: "translateX(-50%)" };
    default:
      return { ...base, right: "3.5rem", top: 0 };
  }
}

/**
 * Gooey Search.
 *
 * A circular search button that, when clicked, detaches its icon in the chosen
 * `direction` while an input expands in the opposite direction. The button and
 * the input live inside a container carrying an SVG `feGaussianBlur` +
 * `feColorMatrix` filter, so the two stay connected by a liquid bridge while
 * they travel. Framer Motion springs drive the motion.
 */
export function GooeySearch({
  direction = "right",
  placeholder = "Search...",
  className,
  onSearch,
}: GooeySearchProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [value, setValue] = useState("");
  const reduceMotion = useReducedMotion();
  const filterId = `gooey-filter-search-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;

  const spring = reduceMotion ? { duration: 0 } : { type: "spring" as const, stiffness: 300, damping: 25 };

  const handleClose = () => {
    setIsOpen(false);
    setValue("");
  };

  return (
    <div className={cn("relative flex h-14 w-14 items-center justify-center", className)}>
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

      <div className="relative h-full w-full" style={{ filter: `url(#${filterId})` }}>
        {/* The Input */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: isOpen ? 1 : 0, opacity: isOpen ? 1 : 0 }}
          transition={spring}
          style={getInputStyle(direction)}
          className="origin-center"
        >
          <input
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={placeholder}
            onBlur={() => {
              if (!value) handleClose();
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && onSearch) onSearch(value);
              if (e.key === "Escape") handleClose();
            }}
            className="h-full w-full rounded-full bg-dead-red px-6 text-sm text-white outline-none placeholder:text-white/50"
            autoFocus={isOpen}
          />
        </motion.div>

        {/* The Icon Button */}
        <motion.button
          type="button"
          onClick={() => setIsOpen((open) => !open)}
          aria-expanded={isOpen}
          aria-label={isOpen ? "Close search" : "Open search"}
          className="absolute left-0 top-0 z-10 flex h-14 w-14 items-center justify-center rounded-full bg-dead-red text-white shadow-md"
          animate={isOpen ? getIconTransform(direction) : { x: 0, y: 0 }}
          transition={spring}
        >
          <AnimatePresence mode="wait">
            {isOpen ? (
              <motion.div
                key="close"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <X className="h-5 w-5" />
              </motion.div>
            ) : (
              <motion.div
                key="search"
                initial={{ rotate: 90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: -90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <Search className="h-5 w-5" />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>
      </div>
    </div>
  );
}
