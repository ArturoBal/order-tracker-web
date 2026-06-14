import { useId, useState } from 'react';
import type { FormEvent } from 'react';
import type { NewOrderInput } from '../types';
import { ApiError } from '../api/ordersApi';

interface OrderFormProps {
  onAddOrder: (input: NewOrderInput) => Promise<void>;
}

interface FormValues {
  customerName: string;
  item: string;
  quantity: string;
  price: string;
}

type FormErrors = Partial<Record<keyof FormValues, string>>;

const initialValues: FormValues = {
  customerName: '',
  item: '',
  quantity: '',
  price: '',
};

const CUSTOMER_NAME_MIN_LENGTH = 3;
const CUSTOMER_NAME_MAX_LENGTH = 40;
const ITEM_MIN_LENGTH = 3;
const ITEM_MAX_LENGTH = 20;
const QUANTITY_MAX = 1000;
const PRICE_MAX = 100000;

function validate(values: FormValues): FormErrors {
  const errors: FormErrors = {};

  const customerName = values.customerName.trim();
  if (!customerName) {
    errors.customerName = 'Customer name is required.';
  } else if (customerName.length < CUSTOMER_NAME_MIN_LENGTH) {
    errors.customerName = `Customer name must be at least ${CUSTOMER_NAME_MIN_LENGTH} characters long.`;
  } else if (customerName.length > CUSTOMER_NAME_MAX_LENGTH) {
    errors.customerName = `Customer name must be at most ${CUSTOMER_NAME_MAX_LENGTH} characters long.`;
  }

  const item = values.item.trim();
  if (!item) {
    errors.item = 'Item is required.';
  } else if (item.length < ITEM_MIN_LENGTH) {
    errors.item = `Item must be at least ${ITEM_MIN_LENGTH} characters long.`;
  } else if (item.length > ITEM_MAX_LENGTH) {
    errors.item = `Item must be at most ${ITEM_MAX_LENGTH} characters long.`;
  }

  const quantity = Number(values.quantity);
  if (!values.quantity.trim() || !Number.isFinite(quantity)) {
    errors.quantity = 'Quantity is required and must be a number.';
  } else if (quantity < 1) {
    errors.quantity = 'Quantity must be at least 1.';
  } else if (quantity > QUANTITY_MAX) {
    errors.quantity = `Quantity must be at most ${QUANTITY_MAX}.`;
  }

  const price = Number(values.price);
  if (!values.price.trim() || !Number.isFinite(price) || price <= 0) {
    errors.price = 'Price must be a positive number.';
  } else if (price > PRICE_MAX) {
    errors.price = `Price must be at most ${PRICE_MAX}.`;
  }

  return errors;
}

export default function OrderForm({ onAddOrder }: OrderFormProps) {
  const [values, setValues] = useState<FormValues>(initialValues);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const idPrefix = useId();

  function handleChange(field: keyof FormValues, value: string) {
    setValues((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const validationErrors = validate(values);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    setSubmitting(true);
    setSubmitError(null);
    try {
      await onAddOrder({
        customerName: values.customerName.trim(),
        item: values.item.trim(),
        quantity: Number(values.quantity),
        price: Number(values.price),
      });
      setValues(initialValues);
      setErrors({});
    } catch (err) {
      setSubmitError(err instanceof ApiError ? err.message : 'Could not add the order. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="order-form" onSubmit={handleSubmit} noValidate>
      <h2>Add Order</h2>
      <div className="order-form__grid">
        <div className="form-field">
          <label htmlFor={`${idPrefix}-customerName`}>Customer name</label>
          <input
            id={`${idPrefix}-customerName`}
            type="text"
            minLength={CUSTOMER_NAME_MIN_LENGTH}
            maxLength={CUSTOMER_NAME_MAX_LENGTH}
            value={values.customerName}
            onChange={(e) => handleChange('customerName', e.target.value)}
            aria-invalid={Boolean(errors.customerName)}
            aria-describedby={errors.customerName ? `${idPrefix}-customerName-error` : undefined}
          />
          {errors.customerName && (
            <p className="form-field__error" id={`${idPrefix}-customerName-error`}>
              {errors.customerName}
            </p>
          )}
        </div>

        <div className="form-field">
          <label htmlFor={`${idPrefix}-item`}>Item</label>
          <input
            id={`${idPrefix}-item`}
            type="text"
            minLength={ITEM_MIN_LENGTH}
            maxLength={ITEM_MAX_LENGTH}
            value={values.item}
            onChange={(e) => handleChange('item', e.target.value)}
            aria-invalid={Boolean(errors.item)}
            aria-describedby={errors.item ? `${idPrefix}-item-error` : undefined}
          />
          {errors.item && (
            <p className="form-field__error" id={`${idPrefix}-item-error`}>
              {errors.item}
            </p>
          )}
        </div>

        <div className="form-field">
          <label htmlFor={`${idPrefix}-quantity`}>Quantity</label>
          <input
            id={`${idPrefix}-quantity`}
            type="number"
            min="1"
            max={QUANTITY_MAX}
            step="any"
            inputMode="decimal"
            value={values.quantity}
            onChange={(e) => handleChange('quantity', e.target.value)}
            aria-invalid={Boolean(errors.quantity)}
            aria-describedby={errors.quantity ? `${idPrefix}-quantity-error` : undefined}
          />
          {errors.quantity && (
            <p className="form-field__error" id={`${idPrefix}-quantity-error`}>
              {errors.quantity}
            </p>
          )}
        </div>

        <div className="form-field">
          <label htmlFor={`${idPrefix}-price`}>Price</label>
          <input
            id={`${idPrefix}-price`}
            type="number"
            min="0"
            max={PRICE_MAX}
            step="any"
            inputMode="decimal"
            value={values.price}
            onChange={(e) => handleChange('price', e.target.value)}
            aria-invalid={Boolean(errors.price)}
            aria-describedby={errors.price ? `${idPrefix}-price-error` : undefined}
          />
          {errors.price && (
            <p className="form-field__error" id={`${idPrefix}-price-error`}>
              {errors.price}
            </p>
          )}
        </div>
      </div>

      {submitError && (
        <p className="form-error" role="alert">
          {submitError}
        </p>
      )}

      <button type="submit" disabled={submitting}>
        {submitting ? 'Adding...' : 'Add Order'}
      </button>
    </form>
  );
}
