import { CardsCarousel } from '@/components/carousel/CardsCarousel'
import { Container } from '@/components/layout/Container'

export function CoverFlowSection() {
  return (
    <Container className="flex flex-col gap-6 py-12">
      <h2 className="text-[28px] font-bold tracking-tight">Featured</h2>
      <CardsCarousel />
    </Container>
  )
}