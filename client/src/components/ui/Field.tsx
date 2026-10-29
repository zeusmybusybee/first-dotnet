import type { ReactNode } from 'react'

type Props = { label: string; htmlFor: string; hint?: string; children: ReactNode }

export function Field({ label, htmlFor, hint, children }: Props) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={htmlFor} className="text-sm font-medium text-zinc-700">
        {label}
      </label>
      {children}
      {hint && <span className="text-[13px] text-muted">{hint}</span>}
    </div>
  )
}