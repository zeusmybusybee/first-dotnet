import { Container } from '@/components/layout/Container'
import { ProductForm } from './ProductForm'
import type { NewProduct } from '../types'

// mantine
import { useDisclosure } from '@mantine/hooks'
import { Modal } from '@mantine/core'
import { BookingForm } from '@/components/ui/BookingForm'

type Props = { onAdd: (p: NewProduct) => Promise<void> }

export function Hero({ onAdd }: Props) {
  const [opened, { open, close }] = useDisclosure(false)

  return (
    <>
      <Modal opened={opened} onClose={close} title="Book an appointment" centered>
        <BookingForm onSuccess={close} />
      </Modal>

      <Container id="top" className="flex flex-wrap items-center gap-12 pt-16 pb-14">
        <div className="flex min-w-0 flex-[1_1_420px] flex-col gap-5">
          <h1 className="text-5xl leading-[1.08] font-bold tracking-tight">
            Your product catalog, in one place.
          </h1>
          <p className="max-w-[46ch] text-lg leading-relaxed text-muted-foreground">
            Add, edit and remove products. Everything saves straight to your PostgreSQL database.
          </p>
          <button
            type="button"
            onClick={open}
            className="inline-flex h-11 items-center self-start rounded-field bg-ink px-5 font-medium text-white hover:bg-ink/90"
          >
            Book Now
          </button>
        </div>
        <ProductForm onSubmit={onAdd} />
      </Container>
    </>
  )
}