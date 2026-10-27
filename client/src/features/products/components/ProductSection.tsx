import { useState } from 'react'
import { Container } from '@/components/layout/Container'
import { Field } from '@/components/ui/Field'
import { Input } from '@/components/ui/Input'
import { ProductCard } from './ProductCard'
import type { Product } from '../types'

type Props = {
  products: Product[]
  loading: boolean
  error: string | null
  onDelete: (id: number) => void
}

export function ProductSection({ products, loading, error, onDelete }: Props) {
  const [query, setQuery] = useState('')
  const visible = products.filter((p) => p.name.toLowerCase().includes(query.toLowerCase()))

  return (
    <Container id="products" className="flex flex-col gap-6 pt-2 pb-18">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h2 className="text-[28px] font-bold tracking-tight">Products</h2>
        <div className="w-full max-w-[280px]">
          <Field label="Search" htmlFor="search">
            <Input
              id="search"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Filter by name"
              className="h-10 text-sm"
            />
          </Field>
        </div>
      </div>

      {loading && <p className="text-muted">Loading products…</p>}
      {error && <p className="text-danger">Could not load products. Is the API running?</p>}
      {!loading && !error && visible.length === 0 && (
        <p className="text-muted">No products yet. Add your first one above.</p>
      )}

      <div className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-4">
        {visible.map((p) => (
          <ProductCard key={p.id} product={p} onDelete={onDelete} />
        ))}
      </div>
    </Container>
  )
}
