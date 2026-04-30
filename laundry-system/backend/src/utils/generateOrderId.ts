import { Types } from "mongoose";

const formatUtcDate = (date: Date): string => {
  const year = date.getUTCFullYear();
  const month = `${date.getUTCMonth() + 1}`.padStart(2, "0");
  const day = `${date.getUTCDate()}`.padStart(2, "0");
  return `${year}${month}${day}`;
};

export const generateOrderId = (
  objectId: Types.ObjectId | string,
  now: Date = new Date(),
): string => {
  const datePart = formatUtcDate(now);
  const idValue =
    typeof objectId === "string" ? objectId : objectId.toHexString();
  const suffix = idValue.slice(-4);
  return `ORD-${datePart}-${suffix}`;
};
