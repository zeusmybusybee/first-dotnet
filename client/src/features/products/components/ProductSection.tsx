import { useMemo, useState } from 'react'
import { Container } from '@/components/layout/Container'
import { Field } from '@/components/ui/Field'
import { Input } from '@/components/ui/Input'
// import { Button } from '@mantine/core';
import { AppSpotlight, spotlight } from '@/components/ui/Appspotlight';
import { PackageIcon } from '@phosphor-icons/react';
// import { Appspotlight, spotlight } from './components/ui/Spotlight';
import { ProductCard } from './ProductCard'
import type { Product } from '../types'
import type { SpotlightActionData } from '@mantine/spotlight'


type Props = {
  products: Product[]
  loading: boolean
  error: string | null
  onDelete: (id: number) => void
}

export function ProductSection({ products, loading, error, onDelete }: Props) {
  const [query, setQuery] = useState('')
  const visible = products.filter((p) => p.name.toLowerCase().includes(query.toLowerCase()))

  // const actions: SpotlightActionData[] = [
  //   { id: 'home', label: 'Home', description: 'Homepage redirections', onClick: () => console.log('Home'), leftSection: <HouseIcon size={24} /> },
  //   { id: 'products-list', label: 'Products List', description: 'List of Products', onClick: () => console.log('Product-List'), leftSection: <GaugeIcon  size={24} /> },
  // ];
  const actions: SpotlightActionData[] = useMemo(
    () =>
      products.map((p) =>({
        id: `product-${p.id}`,
        label: p.name,
        onClick: () => setQuery(p.name), //filter the grid products
        leftSection: <PackageIcon size={24} />,
      })),
      [products] 

  )

  return (
    <Container id="products" className="flex flex-col gap-6 pt-2 pb-18">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h2 className="text-[28px] font-bold tracking-tight">Products</h2>
        <div className="w-full max-w-[280px]">
          <Field  label="Search" htmlFor="search">
            <Input
            onClick={spotlight.open}
              id="search"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search Products"
              className="h-10 text-sm"
            />
          </Field>
          <AppSpotlight actions={actions} />
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
