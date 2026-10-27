import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Hero } from '@/features/products/components/Hero'
import { ProductSection } from '@/features/products/components/ProductSection'
import { useProducts } from '@/features/products/useProducts'

export default function App() {
  const { products, loading, error, add, remove } = useProducts()

  return (
    <>
      <Header />
      <main>
        <Hero onAdd={add} />
        <ProductSection products={products} loading={loading} error={error} onDelete={remove} />
      </main>
      <Footer />
    </>
  )
}