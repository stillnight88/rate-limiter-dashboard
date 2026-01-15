import { Router } from "express";
import { getLogs } from "../controllers/logsController.js";
import { protect, restrictTo } from "../middleware/authMiddleware.js";
import { AdminRole } from "../models/Admin.js";

const router = Router();

router.use(protect);
router.get("/", restrictTo(AdminRole.ADMIN, AdminRole.VIEWER), getLogs);

export default router;