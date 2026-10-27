import { cn } from '@/lib/cn'
import type { InputHTMLAttributes } from 'react'

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        'h-11 rounded-field border border-zinc-400 bg-surface px-3.5 text-[15px]',
        'focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent',
        className,
      )}
      {...props}
    />
  )
}