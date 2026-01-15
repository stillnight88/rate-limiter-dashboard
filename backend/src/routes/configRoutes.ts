import { Router } from "express";
import { getCurrentConfig, updateConfig } from "../controllers/configController.js";
import { protect, restrictTo } from "../middleware/authMiddleware.js";
import { AdminRole } from "../models/Admin.js";

const router = Router();
router.use(protect);

router.get("/current", restrictTo(AdminRole.ADMIN, AdminRole.VIEWER), getCurrentConfig);
router.post("/update", restrictTo(AdminRole.ADMIN), updateConfig);

export default router;