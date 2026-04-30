import { Router } from "express";
import swaggerUi from "swagger-ui-express";
import swaggerDocument from "../config/swagger.json";

const router = Router();

router.get("/swagger.json", (_req, res) => {
  res.json(swaggerDocument);
});

router.use("/", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

export const docsRouter = router;
