import { useState } from 'react'
import type { NewProduct } from '../types/product'

type Props = { onSubmit: (p: NewProduct) => Promise<void> }

export default function ProductForm({ onSubmit }: Props) {
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
    <form onSubmit={submit} className="form">
      <input placeholder="Name" value={name} onChange={e => setName(e.target.value)} />
      <input type="number" step="0.01" placeholder="Price" value={price}
             onChange={e => setPrice(e.target.value)} />
      <button disabled={saving}>{saving ? 'Saving…' : 'Add'}</button>
    </form>
  )
}