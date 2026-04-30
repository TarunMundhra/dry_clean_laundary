import { Router } from "express";
import { body } from "express-validator";
import { login } from "../controllers/auth.controller";
import { validateRequest } from "../middleware/validate.middleware";

const router = Router();

router.post(
  "/login",
  [
    body("username").isString().trim().notEmpty(),
    body("password").isString().trim().notEmpty(),
  ],
  validateRequest,
  login,
);

export const authRouter = router;
