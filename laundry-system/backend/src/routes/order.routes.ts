import { Router } from "express";
import { body, param, query } from "express-validator";
import {
  createOrderHandler,
  getOrderByIdHandler,
  listOrdersHandler,
  updateOrderStatusHandler,
} from "../controllers/order.controller";
import { requireAuth } from "../middleware/auth.middleware";
import { validateRequest } from "../middleware/validate.middleware";

const router = Router();

router.use(requireAuth);

router.post(
  "/",
  [
    body("customerName").isString().trim().notEmpty(),
    body("phoneNumber").matches(/^[6-9]\d{9}$/),
    body("garments").isArray({ min: 1 }),
    body("garments.*.name").isString().trim().notEmpty(),
    body("garments.*.quantity").isInt({ min: 1 }),
  ],
  validateRequest,
  createOrderHandler,
);

router.get(
  "/",
  [
    query("status")
      .optional()
      .isIn(["RECEIVED", "PROCESSING", "READY", "DELIVERED"]),
    query("search").optional().isString().trim(),
    query("page").optional().isInt({ min: 1 }),
    query("limit").optional().isInt({ min: 1 }),
  ],
  validateRequest,
  listOrdersHandler,
);

router.get(
  "/:orderId",
  [param("orderId").isString().trim().notEmpty()],
  validateRequest,
  getOrderByIdHandler,
);

router.patch(
  "/:orderId/status",
  [
    param("orderId").isString().trim().notEmpty(),
    body("status").isIn(["PROCESSING", "READY", "DELIVERED"]),
  ],
  validateRequest,
  updateOrderStatusHandler,
);

export const orderRouter = router;
