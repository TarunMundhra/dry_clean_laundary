import { Router } from "express";
import { getDashboardHandler } from "../controllers/dashboard.controller";
import { requireAuth } from "../middleware/auth.middleware";

const router = Router();

router.use(requireAuth);
router.get("/", getDashboardHandler);

export const dashboardRouter = router;
