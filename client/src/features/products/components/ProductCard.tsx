import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import type { Product } from '../types'

type Props = { product: Product; onDelete: (id: number) => void }

export function ProductCard({ product, onDelete }: Props) {
  const added = new Date(product.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })

  return (
    <Card className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <h3 className="text-[17px] font-semibold">{product.name}</h3>
        <p className="font-mono text-xl text-accent">${product.price.toFixed(2)}</p>
        <p className="text-[13px] text-muted">Added {added}</p>
      </div>
      <div className="flex gap-2 border-t border-zinc-100 pt-3.5">
        <Button variant="ghost" size="sm" className="flex-1">Edit</Button>
        <Button
          variant="danger"
          size="icon"
          aria-label={`Delete ${product.name}`}
          onClick={() => onDelete(product.id)}
        >
          ✕
        </Button>
      </div>
    </Card>
  )
}