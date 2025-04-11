import { HTMLAttributes } from 'react';

export interface VisuallyHiddenProps extends HTMLAttributes<HTMLSpanElement> {}

export function VisuallyHidden({ children, ...props }: VisuallyHiddenProps) {
  return (
    <span
      {...props}
      className="absolute w-[1px] h-[1px] p-0 -m-[1px] overflow-hidden clip-rect-0 border-0"
    >
      {children}
    </span>
  );
} 