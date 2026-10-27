import { cn } from '@/lib/cn'
import type { ButtonHTMLAttributes } from 'react'

const variants = {
  primary: 'bg-accent text-white hover:bg-accent-hover',
  dark: 'bg-ink text-white hover:bg-ink/90',
  ghost: 'border border-zinc-300 bg-surface text-ink hover:bg-page',
  danger: 'border border-zinc-300 bg-surface text-danger hover:bg-red-50',
}

const sizes = {
  md: 'h-11 px-5 text-[15px]',
  sm: 'h-10 px-3 text-sm',
  icon: 'h-10 w-11',
}

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: keyof typeof variants
  size?: keyof typeof sizes
}

export function Button({ variant = 'primary', size = 'md', className, ...props }: Props) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-field font-medium',
        'transition active:scale-[0.98] disabled:opacity-60 cursor-pointer',
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    />
  )
}