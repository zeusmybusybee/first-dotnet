import { useState } from 'react';
import { useForm } from '@mantine/form';
import { TextInput, Select, Button, Stack, Alert } from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { notifications } from '@mantine/notifications';
import dayjs from 'dayjs';

const TIME_SLOTS = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00',
];

type Props = { onSuccess: () => void };

export function BookingForm({ onSuccess }: Props) {
    const [loading, setLoading] = useState(false);
    const [serverError, setServerError] = useState<string | null>(null);

    const form = useForm({
        initialValues: {
            name: '',
            email: '',
            bookingDate: null as string | Date | null,
            bookingTime: null as string | null,
        },
        validate: {
            name: (v) => (v.trim().length < 2 ? 'Name is required' : null),
            email: (v) => (/^\S+@\S+\.\S+$/.test(v) ? null : 'Invalid email'),
            bookingDate: (v) => (v ? null : 'Pick a date'),
            bookingTime: (v) => (v ? null : 'Pick a time'),
        },
    });

    const handleSubmit = async (values: typeof form.values) => {
        setLoading(true);

        try {
            const res = await fetch('/api/bookings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: values.name,
                    email: values.email,
                    bookingDate: dayjs(values.bookingDate).format('YYYY-MM-DD'),
                    bookingTime: `${values.bookingTime}:00`,
                }),
            });

            if (!res.ok) {
                let message = 'Something went wrong. Please try again.';

                if (res.status === 409) {
                    message = 'That time slot is already booked. Please pick another time.';
                } else if (res.status === 400) {
                    const text = await res.text();
                    // Plain text from your past-date check, or JSON from model validation
                    message = text.startsWith('{') ? 'Please check your details and try again.' : text;
                }

                notifications.show({
                    title: 'Booking failed',
                    message,
                    color: 'red',
                    autoClose: 6000,
                });
                return;
            }

            notifications.show({
                title: 'Booking confirmed',
                message: `See you on ${dayjs(values.bookingDate).format('MMM D, YYYY')} at ${values.bookingTime}.`,
                color: 'green',
                autoClose: 5000,
            });

            form.reset();
            onSuccess(); // closes the modal
        } catch {
            notifications.show({
                title: 'Connection error',
                message: 'Cannot reach the server. Please try again later.',
                color: 'red',
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={form.onSubmit(handleSubmit)}>
            <Stack>
                {serverError && <Alert color="red">{serverError}</Alert>}

                <TextInput label="Name" placeholder="Juan Dela Cruz" {...form.getInputProps('name')} />
                <TextInput label="Email" placeholder="juan@example.com" {...form.getInputProps('email')} />
                <DateInput
                    label="Date"
                    placeholder="Pick a date"
                    minDate={new Date()}
                    {...form.getInputProps('bookingDate')}
                />
                <Select
                    label="Time"
                    placeholder="Pick a time"
                    data={TIME_SLOTS}
                    {...form.getInputProps('bookingTime')}
                />

                <Button type="submit" loading={loading}>
                    Book appointment
                </Button>
            </Stack>
        </form>
    );
}