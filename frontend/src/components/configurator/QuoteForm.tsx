import { CONTACT, customerSchema, type CustomerData, type CustomerInput } from '@afrodisiaco/shared';
import { zodResolver } from '@hookform/resolvers/zod';
import { useId, type InputHTMLAttributes } from 'react';
import { useForm, type UseFormRegisterReturn } from 'react-hook-form';
import { Button } from '@/components/ui/Button';

interface FieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  registration: UseFormRegisterReturn;
}

const INPUT = 'min-h-12 w-full rounded-sm border bg-noir-2 px-4 py-3 text-base text-humo placeholder:text-ceniza/60';

function Field({ label, error, registration, ...rest }: FieldProps) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.2em] text-ceniza">
        {label}
      </label>
      <input
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        className={`${INPUT} ${error ? 'border-ember' : 'border-line'}`}
        {...registration}
        {...rest}
      />
      {error && (
        <p id={`${id}-error`} role="alert" className="mt-1 text-sm text-ember">
          {error}
        </p>
      )}
    </div>
  );
}

interface Props {
  submitting: boolean;
  onSubmit: (customer: CustomerData) => void;
}

/** Datos de contacto del cliente. No deja enviar si falta algo o hay un dato inválido. */
export function QuoteForm({ submitting, onSubmit }: Props) {
  const commentsId = useId();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CustomerInput, unknown, CustomerData>({
    resolver: zodResolver(customerSchema),
    mode: 'onBlur',
    defaultValues: { customerName: '', phone: '', email: '', eventDate: '', city: CONTACT.city, comments: '' },
  });
  const today = new Date().toISOString().slice(0, 10);

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="grid gap-4">
      <Field label="Nombre completo" autoComplete="name" placeholder="Tu nombre" error={errors.customerName?.message} registration={register('customerName')} />
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="WhatsApp" type="tel" inputMode="tel" autoComplete="tel" placeholder="449 000 0000" error={errors.phone?.message} registration={register('phone')} />
        <Field label="Correo" type="email" autoComplete="email" placeholder="tu@correo.com" error={errors.email?.message} registration={register('email')} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Fecha del evento" type="date" min={today} error={errors.eventDate?.message} registration={register('eventDate')} />
        <Field label="Ciudad" autoComplete="address-level2" error={errors.city?.message} registration={register('city')} />
      </div>
      <div>
        <label htmlFor={commentsId} className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.2em] text-ceniza">
          Comentarios <span className="normal-case tracking-normal">(opcional)</span>
        </label>
        <textarea
          id={commentsId}
          rows={4}
          maxLength={600}
          placeholder="Lugar, horario, la vibra que buscas…"
          aria-invalid={errors.comments ? true : undefined}
          className={`${INPUT} ${errors.comments ? 'border-ember' : 'border-line'}`}
          {...register('comments')}
        />
        {errors.comments && (
          <p role="alert" className="mt-1 text-sm text-ember">
            {errors.comments.message}
          </p>
        )}
      </div>
      <Button type="submit" variant="gold" disabled={submitting} className="w-full">
        {submitting ? 'Enviando…' : 'Solicitar cotización'}
      </Button>
    </form>
  );
}
