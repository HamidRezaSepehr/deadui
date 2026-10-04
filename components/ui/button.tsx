import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dead-red focus-visible:ring-offset-2 focus-visible:ring-offset-dead-950 disabled:pointer-events-none disabled:opacity-40 [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-dead-red text-dead-50 hover:bg-dead-red-hover shadow-[0_0_15px_rgba(220,38,38,0.1)]",
        outline:
          "border border-dead-800 bg-transparent text-dead-50 hover:bg-dead-900 hover:border-dead-700",
        ghost: "bg-transparent text-dead-400 hover:bg-dead-900 hover:text-dead-50",
        secondary: "bg-dead-800 text-dead-50 hover:bg-dead-700",
        link: "bg-transparent text-dead-red underline-offset-4 hover:underline",
      },
      size: {
        sm: "h-8 rounded-md px-3 text-xs [&_svg]:size-3.5",
        default: "h-10 px-4 py-2 [&_svg]:size-4",
        lg: "h-12 rounded-lg px-6 text-base [&_svg]:size-5",
        icon: "size-10 [&_svg]:size-4",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  );
}

export { buttonVariants };