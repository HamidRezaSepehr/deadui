"use client";

import * as React from "react";
import { Command as CommandPrimitive } from "cmdk";
import { SearchIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";

export function Command({
  className,
  children,
  ...props
}: React.ComponentPropsWithoutRef<typeof CommandPrimitive>) {
  return (
    <CommandPrimitive
      className={cn(
        "flex h-full w-full flex-col overflow-hidden rounded-xl bg-dead-900 text-dead-50",
        className,
      )}
      {...props}
    >
      {children}
    </CommandPrimitive>
  );
}

export interface CommandDialogProps
  extends React.ComponentPropsWithoutRef<typeof Dialog> {
  title?: string;
  description?: string;
  className?: string;
  /**
   * Optional cmdk scoring function. cmdk's default is a fuzzy subsequence match,
   * which over-matches on long text; pass a stricter scorer when items have
   * descriptions that would otherwise produce nonsense results.
   */
  filter?: React.ComponentPropsWithoutRef<typeof CommandPrimitive>["filter"];
}

export function CommandDialog({
  title = "Search",
  description = "Search the Dead UI documentation",
  className,
  children,
  filter,
  ...props
}: CommandDialogProps) {
  return (
    <Dialog {...props}>
      <DialogContent
        showCloseButton={false}
        className={cn("overflow-hidden p-0", className)}
      >
        <DialogTitle className="sr-only">{title}</DialogTitle>
        <DialogDescription className="sr-only">{description}</DialogDescription>
        <Command filter={filter} className="rounded-xl [&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:py-2 [&_[cmdk-group-heading]]:font-mono [&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-widest [&_[cmdk-group-heading]]:text-dead-400 [&_[cmdk-group]]:px-2 [&_[cmdk-input-wrapper]_svg]:size-4 [&_[cmdk-input]]:h-14 [&_[cmdk-item]]:rounded-md [&_[cmdk-item]]:px-3 [&_[cmdk-item]_svg]:size-4">
          {children}
        </Command>
      </DialogContent>
    </Dialog>
  );
}

export function CommandInput({
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof CommandPrimitive.Input>) {
  return (
    <div className="flex items-center gap-3 border-b border-dead-800 px-4">
      <SearchIcon className="size-4 shrink-0 text-dead-400" />
      <CommandPrimitive.Input
        className={cn(
          "h-14 w-full bg-transparent text-sm text-dead-50 outline-none placeholder:text-dead-400 disabled:opacity-40",
          className,
        )}
        {...props}
      />
    </div>
  );
}

export function CommandList({
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof CommandPrimitive.List>) {
  return (
    <CommandPrimitive.List
      className={cn("max-h-80 overflow-y-auto overflow-x-hidden p-2", className)}
      {...props}
    />
  );
}

export type CommandEmptyProps = React.ComponentPropsWithoutRef<
  typeof CommandPrimitive.Empty
>;

export function CommandEmpty({ className, ...props }: CommandEmptyProps) {
  return (
    <CommandPrimitive.Empty
      className={cn("py-8 text-center text-sm text-dead-400", className)}
      {...props}
    />
  );
}

export type CommandGroupProps = React.ComponentPropsWithoutRef<
  typeof CommandPrimitive.Group
>;

export function CommandGroup({ className, ...props }: CommandGroupProps) {
  return (
    <CommandPrimitive.Group
      className={cn("overflow-hidden text-dead-50", className)}
      {...props}
    />
  );
}

export type CommandItemProps = React.ComponentPropsWithoutRef<
  typeof CommandPrimitive.Item
>;

export function CommandItem({ className, ...props }: CommandItemProps) {
  return (
    <CommandPrimitive.Item
      className={cn(
        "relative flex cursor-default select-none items-center gap-3 px-3 py-2.5 text-sm text-dead-200 outline-none transition-colors duration-150 data-[selected=true]:bg-dead-800 data-[selected=true]:text-dead-50",
        className,
      )}
      {...props}
    />
  );
}

export function CommandSeparator({
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof CommandPrimitive.Separator>) {
  return (
    <CommandPrimitive.Separator
      className={cn("-mx-1 my-1 h-px bg-dead-800", className)}
      {...props}
    />
  );
}