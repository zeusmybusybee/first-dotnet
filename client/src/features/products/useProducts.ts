import { useCallback, useEffect, useState } from 'react'
import { productsApi } from './api'
import type { NewProduct, Product } from './types'

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    try {
      setError(null)
      setProducts(await productsApi.getAll())
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const add = async (p: NewProduct) => { await productsApi.create(p); await load() }
  const remove = async (id: number) => { await productsApi.remove(id); await load() }

  return { products, loading, error, add, remove }
}