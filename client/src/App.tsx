import { useEffect, useState } from 'react'
import { productsApi } from './api/products'
import ProductForm from './components/ProductForm'
import ProductList from './components/ProductList'
import type { NewProduct, Product } from './types/product'

export default function App() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = async () => {
    try {
      setError(null)
      setProducts(await productsApi.getAll())
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const add = async (p: NewProduct) => {
    await productsApi.create(p)
    await load()
  }

  const remove = async (id: number) => {
    await productsApi.remove(id)
    await load()
  }

  return (
    <main className="container">
      <h1>Products</h1>
      <ProductForm onSubmit={add} />
      {loading && <p>Loading…</p>}
      {error && <p className="error">Error: {error}. Is the API running?</p>}
      {!loading && !error && <ProductList products={products} onDelete={remove} />}
    </main>
  )
}