import type { Product } from '../types/product'

type Props = { products: Product[]; onDelete: (id: number) => void }

export default function ProductList({ products, onDelete }: Props) {
  if (products.length === 0) return <p>No products yet.</p>

  return (
    <ul className="list">
      {products.map(p => (
        <li key={p.id}>
          <span>{p.name}</span>
          <span>${p.price.toFixed(2)}</span>
          <button onClick={() => onDelete(p.id)}>Delete</button>
        </li>
      ))}
    </ul>
  )
}