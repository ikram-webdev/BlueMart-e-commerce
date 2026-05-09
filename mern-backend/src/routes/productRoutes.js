import { Router } from "express";
import { approveProduct, createProduct, listProducts } from "../controllers/productController.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = Router();

router.get("/", listProducts);
router.post("/", requireAuth, requireRole("admin", "vendor"), createProduct);
router.patch("/:productId/approve", requireAuth, requireRole("admin"), approveProduct);

export default router;
