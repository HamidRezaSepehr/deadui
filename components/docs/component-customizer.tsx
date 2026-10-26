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
  /** Dot-separated nested path, e.g. "config.CURL". Defaults to the control key. */
  path?: string;
};

export type SelectControl = {
  type: "select";
  options: string[];
  path?: string;
};

export type ColorControl = {
  type: "color";
  path?: string;
};

export type BooleanControl = {
  type: "boolean";
  path?: string;
};

export type ControlConfig = Record<
  string,
  SliderControl | SelectControl | ColorControl | BooleanControl
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
  const updateProp = useCallback((key: string, value: unknown, path?: string) => {
    if (path) {
      const keys = path.split(".")
      setProps((prev) => {
        const copy = structuredClone(prev)
        let obj: any = copy
        for (let i = 0; i < keys.length - 1; i++) {
          if (obj[keys[i]] == null || typeof obj[keys[i]] !== "object") {
            obj[keys[i]] = {}
          }
          obj = obj[keys[i]]
        }
        obj[keys[keys.length - 1]] = value
        return copy
      })
    } else {
      setProps((prev) => ({ ...prev, [key]: value }))
    }
  }, [])

  // `React.ElementType` erases the component's own props type, which is the
  // whole point — the customizer must accept any registry component — so the
  // spread is confined to this one cast.
  const Preview = Component as React.ComponentType<Record<string, unknown>>;

  function getValue(pathOrKey: string, propsObj: Record<string, unknown>): unknown {
    const keys = pathOrKey.includes(".") ? pathOrKey.split(".") : [pathOrKey]
    let val: any = propsObj
    for (const k of keys) {
      if (val == null || typeof val !== "object") return undefined
      val = val[k]
    }
    return val
  }

  return (
    <div className={cn("grid grid-cols-1 gap-8 lg:grid-cols-4", className)}>
      {/* Preview Area */}
      <div className="bg-preview-grid relative col-span-1 flex h-[75vh] w-full items-center justify-center overflow-hidden rounded-xl border border-dead-800 bg-dead-900 p-8 lg:col-span-3">
        <Preview {...props} />
      </div>

      {/* Controls Area */}
      <div className="h-fit space-y-6 rounded-xl border border-dead-800 bg-dead-800 p-6 lg:col-span-1">
        <h3 className="font-mono text-xs font-semibold uppercase tracking-widest text-dead-50">
          Customize
        </h3>

        {Object.entries(controls).map(([key, control]) => {
          const currentValue = getValue(control.path || key, props)
          return (
          <div key={key} className="space-y-2">
            <div className="flex items-baseline justify-between gap-2">
              <label
                htmlFor={`control-${key}`}
                className="text-xs font-medium text-dead-400"
              >
                {humanize(key)}
              </label>
              <span className="font-mono text-[11px] text-dead-400">
                {formatValue(currentValue)}
                {control.type === "slider" && control.unit ? control.unit : ""}
              </span>
            </div>

            {control.type === "slider" && (
              <Slider
                id={`control-${key}`}
                min={control.min}
                max={control.max}
                step={control.step}
                value={[Number(currentValue ?? control.min)]}
                onValueChange={([value]) => updateProp(key, value, control.path)}
                aria-label={humanize(key)}
              />
            )}

            {control.type === "select" && (
              <Select
                value={typeof currentValue === "string" ? currentValue : ""}
                onValueChange={(value) => updateProp(key, value, control.path)}
              >
                <SelectTrigger
                  id={`control-${key}`}
                  aria-label={humanize(key)}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {control.options.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {control.type === "boolean" && (
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  id={`control-${key}`}
                  type="checkbox"
                  aria-label={humanize(key)}
                  checked={!!currentValue}
                  onChange={(event) => updateProp(key, event.target.checked, control.path)}
                  className="h-5 w-5 rounded border border-dead-700 bg-dead-950 text-dead-red focus-visible:ring-2 focus-visible:ring-dead-red"
                />
                <span className="text-xs text-dead-300">{currentValue ? "On" : "Off"}</span>
              </label>
            )}

            {control.type === "color" && (
              <input
                id={`control-${key}`}
                type="color"
                aria-label={humanize(key)}
                value={
                  typeof currentValue === "string" ? currentValue : "#000000"
                }
                onChange={(event) => updateProp(key, event.target.value, control.path)}
                className="h-10 w-full cursor-pointer rounded-md border border-dead-800 bg-dead-900 p-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dead-red"
              />
            )}

          </div>
          )
        })}
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