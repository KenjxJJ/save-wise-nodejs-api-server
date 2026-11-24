import { Router } from "express";
import { authRoutes } from "./auth.routes.js";
import { userRoutes } from "./user.routes.js";
import { goalRoutes } from "./goal.routes.js";
import { walletRoutes } from "./wallet.routes.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/goals", goalRoutes);
router.use("/wallet", walletRoutes);

export const apiV1Routes = router;
