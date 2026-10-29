import { Container } from './Container'

export function Header() {
  return (
    <header className="border-b border-line bg-surface">
      <Container className="flex h-[68px] items-center justify-between">
        <a href="#top" className="flex items-center gap-2.5 text-lg font-semibold text-ink">
          <span className="grid size-8 place-items-center rounded-field bg-accent font-bold text-white">
            S
          </span>
          Shelf Taguan
        </a>
        <nav aria-label="Main" className="flex gap-6 font-medium text-zinc-700">
          <a href="#products" className="hover:text-ink">
            Products
          </a>
          <a href="#add" className="hover:text-ink">
            Add product
          </a>
          <a href="#list" className="hover:text-ink">
            List of Products
          </a>
        </nav>
      </Container>
    </header>
  )
} 
