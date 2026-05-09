import { Router } from "express";
import authRoutes from "./authRoutes.js";
import productRoutes from "./productRoutes.js";

const router = Router();

router.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "bluemart-mern-api" });
});

router.use("/auth", authRoutes);
router.use("/products", productRoutes);

export default router;
