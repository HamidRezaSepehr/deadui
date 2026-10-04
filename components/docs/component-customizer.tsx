"use client";

import { useCallback, useState } from "react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

export type SliderControl = {
  type: "slider";
  min: number;
  max: number;
  step: number;
  /** Shown next to the label so the current number is always readable. */
  unit?: string;
};

export type SelectControl = {
  type: "select";
  options: string[];
};

export type ColorControl = {
  type: "color";
};

export type ControlConfig = Record<
  string,
  SliderControl | SelectControl | ColorControl
>;

export interface ComponentCustomizerProps {
  /** Any registry component. Previewed with the props below. */
  component: React.ElementType;
  defaultProps: Record<string, unknown>;
  controls: ControlConfig;
  className?: string;
}

/** `variant` -> `Variant`, `splitBy` -> `Split By`. */
function humanize(key: string): string {
  const spaced = key.replace(/([A-Z])/g, " $1").trim();
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

/**
 * Live prop playground.
 *
 * The controls are generated from `controls` rather than hand-written per
 * component, so a new docs page only has to declare which props are worth
 * exposing. One flat `Record<string, unknown>` of props is the whole state:
 * every control writes a single key into it and the preview spreads it, so a
 * slider and a select are the same operation as far as React is concerned.
 */
export function ComponentCustomizer({
  component: Component,
  defaultProps,
  controls,
  className,
}: ComponentCustomizerProps) {
  const [props, setProps] = useState<Record<string, unknown>>({
    ...defaultProps,
  });

  // Functional update: two controls touched in the same tick both survive.
  const updateProp = useCallback((key: string, value: unknown) => {
    setProps((prev) => ({ ...prev, [key]: value }));
  }, []);

  // `React.ElementType` erases the component's own props type, which is the
  // whole point — the customizer must accept any registry component — so the
  // spread is confined to this one cast.
  const Preview = Component as React.ComponentType<Record<string, unknown>>;

  return (
    <div className={cn("grid grid-cols-1 gap-8 lg:grid-cols-3", className)}>
      {/* Preview Area */}
      <div className="bg-preview-grid relative col-span-1 flex min-h-[400px] items-center justify-center overflow-hidden rounded-xl border border-dead-800 bg-dead-900 p-8 lg:col-span-2">
        <Preview {...props} />
      </div>

      {/* Controls Area */}
      <div className="h-fit space-y-6 rounded-xl border border-dead-800 bg-dead-800 p-6">
        <h3 className="font-mono text-xs font-semibold uppercase tracking-widest text-dead-50">
          Customize
        </h3>

        {Object.entries(controls).map(([key, config]) => (
          <div key={key} className="space-y-2">
            <div className="flex items-baseline justify-between gap-2">
              <label
                htmlFor={`control-${key}`}
                className="text-xs font-medium text-dead-400"
              >
                {humanize(key)}
              </label>
              <span className="font-mono text-[11px] text-dead-400">
                {formatValue(props[key])}
                {config.type === "slider" && config.unit ? config.unit : ""}
              </span>
            </div>

            {config.type === "slider" && (
              <Slider
                id={`control-${key}`}
                min={config.min}
                max={config.max}
                step={config.step}
                value={[Number(props[key] ?? config.min)]}
                onValueChange={([value]) => updateProp(key, value)}
                aria-label={humanize(key)}
              />
            )}

            {config.type === "select" && (
              <Select
                value={typeof props[key] === "string" ? (props[key] as string) : ""}
                onValueChange={(value) => updateProp(key, value)}
              >
                <SelectTrigger
                  id={`control-${key}`}
                  aria-label={humanize(key)}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {config.options.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {config.type === "color" && (
              <input
                id={`control-${key}`}
                type="color"
                aria-label={humanize(key)}
                value={
                  typeof props[key] === "string" ? (props[key] as string) : "#000000"
                }
                onChange={(event) => updateProp(key, event.target.value)}
                className="h-10 w-full cursor-pointer rounded-md border border-dead-800 bg-dead-900 p-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dead-red"
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function formatValue(value: unknown): string {
  if (value === undefined || value === null) return "—";
  if (typeof value === "number") return String(value);
  if (typeof value === "boolean") return value ? "true" : "false";
  return String(value);
}