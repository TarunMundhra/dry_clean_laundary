import { useMemo, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import axios from "axios";
import { api } from "../api/client";
import { ApiSuccess, CreateOrderPayload, Order } from "../types";

const GARMENT_CATALOG = {
  Shirt: 49,
  Pants: 59,
  Saree: 149,
  Suit: 199,
  Jacket: 129,
  Kurta: 79,
  Dress: 99,
  Bedsheet: 119,
  Curtain: 139,
  Woolen: 169
} as const;

const garmentNames = Object.keys(GARMENT_CATALOG) as Array<keyof typeof GARMENT_CATALOG>;

const orderSchema = z.object({
  customerName: z.string().min(1, "Customer name is required"),
  phoneNumber: z
    .string()
    .regex(/^[6-9]\d{9}$/, "Phone number must be a valid 10-digit number"),
  garments: z
    .array(
      z.object({
        name: z.enum(garmentNames as [string, ...string[]]),
        quantity: z.number().int().min(1, "Quantity must be at least 1")
      })
    )
    .min(1, "Add at least one garment")
});

type OrderFormValues = z.infer<typeof orderSchema>;

interface CreateOrderFormProps {
  onCreated: (order: Order) => void;
  onCancel: () => void;
}

export const CreateOrderForm = ({ onCreated, onCancel }: CreateOrderFormProps) => {
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors, isSubmitting }
  } = useForm<OrderFormValues>({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      customerName: "",
      phoneNumber: "",
      garments: [{ name: "Shirt", quantity: 1 }]
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "garments"
  });

  const watchedGarments = watch("garments");

  const totalAmount = useMemo(() => {
    return watchedGarments.reduce((total, garment) => {
      const price = GARMENT_CATALOG[garment.name] ?? 0;
      return total + price * (garment.quantity || 0);
    }, 0);
  }, [watchedGarments]);

  const onSubmit = async (values: OrderFormValues) => {
    setSubmitError(null);
    try {
      const payload: CreateOrderPayload = {
        customerName: values.customerName,
        phoneNumber: values.phoneNumber,
        garments: values.garments.map((item) => ({
          name: item.name,
          quantity: item.quantity
        }))
      };
      const response = await api.post<ApiSuccess<Order>>("/orders", payload);
      onCreated(response.data.data);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setSubmitError(error.response?.data?.error?.message ?? "Failed to create order");
      } else {
        setSubmitError("Failed to create order");
      }
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div>
        <label className="text-sm font-semibold text-slate">Customer Name</label>
        <input
          {...register("customerName")}
          className="mt-2 w-full rounded-xl border border-ink/20 px-4 py-2"
          placeholder="Customer name"
        />
        {errors.customerName && (
          <p className="mt-1 text-xs text-red-500">{errors.customerName.message}</p>
        )}
      </div>
      <div>
        <label className="text-sm font-semibold text-slate">Phone Number</label>
        <input
          {...register("phoneNumber")}
          className="mt-2 w-full rounded-xl border border-ink/20 px-4 py-2"
          placeholder="10-digit mobile"
        />
        {errors.phoneNumber && (
          <p className="mt-1 text-xs text-red-500">{errors.phoneNumber.message}</p>
        )}
      </div>
      <div>
        <div className="flex items-center justify-between">
          <label className="text-sm font-semibold text-slate">Garments</label>
          <button
            type="button"
            onClick={() => append({ name: "Shirt", quantity: 1 })}
            className="text-xs font-semibold text-teal"
          >
            + Add garment
          </button>
        </div>
        <div className="mt-3 space-y-3">
          {fields.map((field, index) => (
            <div
              key={field.id}
              className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_120px_auto]"
            >
              <select
                {...register(`garments.${index}.name`)}
                className="rounded-xl border border-ink/20 px-4 py-2"
              >
                {garmentNames.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
              <input
                type="number"
                min={1}
                {...register(`garments.${index}.quantity`, { valueAsNumber: true })}
                className="rounded-xl border border-ink/20 px-4 py-2"
              />
              <button
                type="button"
                onClick={() => remove(index)}
                className="rounded-xl border border-ink/20 px-3 py-2 text-xs"
                disabled={fields.length === 1}
              >
                Remove
              </button>
            </div>
          ))}
        </div>
        {errors.garments && (
          <p className="mt-1 text-xs text-red-500">{errors.garments.message}</p>
        )}
      </div>
      <div className="rounded-xl bg-sand/60 px-4 py-3 text-sm">
        Estimated total: <span className="font-semibold">Rs. {totalAmount}</span>
      </div>
      {submitError && (
        <p className="rounded-xl bg-red-50 px-3 py-2 text-xs text-red-600">
          {submitError}
        </p>
      )}
      <div className="flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-full border border-ink/20 px-4 py-2 text-sm"
          disabled={isSubmitting}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="rounded-full bg-ink px-5 py-2 text-sm font-semibold text-paper"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Saving..." : "Create Order"}
        </button>
      </div>
    </form>
  );
};
