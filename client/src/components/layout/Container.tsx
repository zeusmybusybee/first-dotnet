import { cn } from '@/lib/cn'
import type { HTMLAttributes } from 'react'

export function Container({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('mx-auto max-w-[1120px] px-6', className)} {...props} />
}