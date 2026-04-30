import { Schema, model, Document } from "mongoose";
import { IOrder } from "../types";

export interface OrderDocument extends IOrder, Document {}

const garmentItemSchema = new Schema(
  {
    name: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    pricePerItem: { type: Number, required: true, min: 0 },
    subtotal: { type: Number, required: true, min: 0 },
  },
  { _id: false },
);

const orderSchema = new Schema<OrderDocument>(
  {
    orderId: { type: String, required: true, unique: true, index: true },
    customerName: { type: String, required: true, trim: true },
    phoneNumber: { type: String, required: true },
    garments: { type: [garmentItemSchema], required: true },
    totalAmount: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      required: true,
      enum: ["RECEIVED", "PROCESSING", "READY", "DELIVERED"],
      default: "RECEIVED",
    },
    estimatedDeliveryDate: { type: Date, required: true },
  },
  { timestamps: true },
);

export const Order = model<OrderDocument>("Order", orderSchema);
