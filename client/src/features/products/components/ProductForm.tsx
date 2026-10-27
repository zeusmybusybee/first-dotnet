import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Field } from '@/components/ui/Field'
import { Input } from '@/components/ui/Input'
import type { NewProduct } from '../types'

type Props = { onSubmit: (p: NewProduct) => Promise<void> }

export function ProductForm({ onSubmit }: Props) {
  const [name, setName] = useState('')
  const [price, setPrice] = useState('')
  const [saving, setSaving] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !price) return
    setSaving(true)
    await onSubmit({ name, price: Number(price) })
    setName('')
    setPrice('')
    setSaving(false)
  }

  return (
    <form
      id="add"
      onSubmit={submit}
      className="flex min-w-0 flex-[1_1_360px] flex-col gap-[18px] rounded-card border border-line bg-surface p-7 shadow-[0_12px_32px_rgba(24,24,27,0.06)]"
    >
      <h2 className="text-xl font-semibold">Add product</h2>
      <Field label="Name" htmlFor="p-name">
        <Input
          id="p-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Mechanical keyboard"
        />
      </Field>
      <Field label="Price (USD)" htmlFor="p-price" hint="Use a dot for cents, like 49.99">
        <Input
          id="p-price"
          type="number"
          step="0.01"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          placeholder="0.00"
        />
      </Field>
      <Button type="submit" disabled={saving}>
        {saving ? 'Saving…' : '+ Add product'}
      </Button>
    </form>
  )
}
