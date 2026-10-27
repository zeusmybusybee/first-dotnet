import type { NewProduct, Product } from '../types/product'

const BASE = import.meta.env.VITE_API_URL ?? ''
const URL = `${BASE}/api/products`

async function handle<T>(res: Response): Promise<T> {
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`)
  return res.status === 204 ? (undefined as T) : res.json()
}

export const productsApi = {
  getAll: () => fetch(URL).then(r => handle<Product[]>(r)),

  create: (p: NewProduct) =>
    fetch(URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(p),
    }).then(r => handle<Product>(r)),

  update: (id: number, p: NewProduct) =>
    fetch(`${URL}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(p),
    }).then(r => handle<void>(r)),

  remove: (id: number) =>
    fetch(`${URL}/${id}`, { method: 'DELETE' }).then(r => handle<void>(r)),
}