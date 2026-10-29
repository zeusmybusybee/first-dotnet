import { Container } from './Container'

export function Footer() {
  return (
    <footer className="border-t border-line bg-surface">
      <Container className="flex flex-wrap justify-between gap-3 py-6 text-sm text-muted">
        <span>Shelf taguan, a practice project</span>
        <span>USE Case: ASP.NET Core, PostgreSQL and React</span>
      </Container>
    </footer>
  )
}
