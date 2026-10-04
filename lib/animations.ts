import { gsap } from "gsap";
import type { ScrollTrigger } from "gsap/ScrollTrigger";

type EaseName = gsap.EaseString;

export const EASE: {
  micro: EaseName;
  standard: EaseName;
  dramatic: EaseName;
  loop: EaseName;
} = {
  micro: "power2.out",
  standard: "power2.out",
  dramatic: "power3.out",
  loop: "none",
};

export const DURATION = {
  micro: 0.2,
  standard: 0.6,
  dramatic: 1,
} as const;

export const LOOP_DURATION = {
  min: 2,
  max: 4,
} as const;

export const SPRING_PHYSICS = {
  stiffness: 300,
  damping: 20,
} as const;

export const SCRUB_DURATION = 1;

export const SCROLL_START = "top 85%";

export const SCROLL_TOGGLE_ACTIONS = "play none none reverse";

export const GSAP_DEFAULTS = {
  duration: 0.8,
  stagger: 0.05,
} as const;

export const SCROLL_TRIGGER_DEFAULTS = {
  start: SCROLL_START,
  end: "bottom top",
  toggleActions: SCROLL_TOGGLE_ACTIONS,
} as const;

export function scrollTriggerDefaults(
  trigger: Element | null,
  overrides: Partial<ScrollTrigger.Vars> = {}
): ScrollTrigger.Vars {
  return {
    trigger: trigger ?? undefined,
    start: SCROLL_START,
    toggleActions: SCROLL_TOGGLE_ACTIONS,
    ...overrides,
  };
}

export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}