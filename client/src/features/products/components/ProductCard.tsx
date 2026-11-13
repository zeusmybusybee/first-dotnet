import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import type { Product } from '../types'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/shadcn/alert-dialog'

type Props = { product: Product; onDelete: (id: number) => void }

export function ProductCard({ product, onDelete }: Props) {
  const [open, setOpen] = useState(false);
  const [deleting, setDeleting] = useState(false)
  const added = new Date(product.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })

  const confirmDelete = async () => {
    setDeleting(true)
    await onDelete(product.id)
    setDeleting(false)
    setOpen(false)
  }

  return (
    <Card className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <h3 className="text-[17px] font-semibold">{product.name}</h3>
        <p className="font-mono text-xl text-accent">${product.price.toFixed(2)}</p>
        <p className="text-[13px] text-muted-foreground">Added {added}</p>
      </div>
      <div className="flex gap-2 border-t border-zinc-100 pt-3.5">
        <Button variant="ghost" size="sm" className="flex-1">Edit</Button>
        <AlertDialog open={open} onOpenChange={setOpen}>
          <AlertDialogTrigger
            render={<Button variant="danger" size="icon" aria-label={'Delete ${product.name}'}/>}>
              ✕
          </AlertDialogTrigger>

          <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete {product.name}?</AlertDialogTitle>
                <AlertDialogDescription>
                    This removes it from the product. You cannot undo this.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction variant="destructive" onClick={confirmDelete} disabled={deleting}>
                    {deleting ? 'Deleting product...' : 'Delete'}
                </AlertDialogAction>
              </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        {/* <Button
          variant="danger"
          size="icon"
          aria-label={`Delete ${product.name}`}
          onClick={() => onDelete(product.id)}
        >
          ✕
        </Button> */}
      </div>
    </Card>
  )
}