export type Product = {
  id: number
  name: string
  price: number
  createdAt: string
}

export type NewProduct = Pick<Product, 'name' | 'price'>
