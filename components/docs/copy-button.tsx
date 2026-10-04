"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { CheckIcon, CopyIcon } from "lucide-react";

/**
 * "Copy" affordance for every fenced code block.
 *
 * Mounted by the global `pre` mapping in `mdx-components.tsx` and by
 * `install-tabs.tsx`, both of which place this button as a sibling of the `<pre>`
 * inside a `group relative` wrapper — so the button positions itself over the
 * block without the author having to add anything.
 *
 * The text is read from the DOM rather than passed as a prop because MDX hands
 * `pre` real children elements, not a string, and this component also renders in
 * a Server Component tree where the code text is not reachable as a plain value.
 * It is therefore looked up through the wrapper: `closest('pre')` would only walk
 * ancestors, and the `<pre>` is a sibling, not an ancestor.
 */
export function CopyButton() {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [copied, setCopied] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const handleCopy = useCallback(() => {
    const scope = buttonRef.current?.parentElement;
    const text = scope?.querySelector("pre")?.textContent ?? "";
    if (!text) return;

    // The async Clipboard API is unavailable on insecure origins and in older
    // browsers; the legacy path still works there, so the button is never a
    // no-op just because a page is served over plain http.
    const done = () => {
      setCopied(true);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => setCopied(false), 1600);
    };

    if (navigator.clipboard?.writeText) {
      void navigator.clipboard.writeText(text).then(done, () => {
        if (copyWithTextarea(text)) done();
      });
      return;
    }

    if (copyWithTextarea(text)) done();
  }, []);

  return (
    <button
      ref={buttonRef}
      type="button"
      onClick={handleCopy}
      aria-label={copied ? "Copied" : "Copy code"}
      className="absolute right-2 top-2 inline-flex size-7 items-center justify-center rounded-md border border-dead-800 bg-dead-900/90 text-dead-400 opacity-0 backdrop-blur transition-[opacity,color] duration-200 ease-out hover:text-dead-50 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dead-red group-hover:opacity-100 data-[copied=true]:text-dead-red"
      data-copied={copied}
    >
      {copied ? <CheckIcon className="size-3.5" /> : <CopyIcon className="size-3.5" />}
    </button>
  );
}

/** Legacy `execCommand` copy, for insecure origins and old browsers. */
function copyWithTextarea(text: string): boolean {
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.select();
  let copied = false;
  try {
    copied = document.execCommand("copy");
  } catch {
    copied = false;
  }
  document.body.removeChild(textarea);
  return copied;
}