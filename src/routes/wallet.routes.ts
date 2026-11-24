import { Router } from "express";
import { WalletController } from "../controllers/wallet.controller.js";
import { requireAuth } from "../middlewares/auth.middleware.js";
import { validateBody } from "../middlewares/validate.middleware.js";
import {
  fundWalletSchema,
  updateSettingsSchema,
} from "../validators/wallet.validator.js";

const router = Router();

// All wallet routes require authentication
router.use(requireAuth);

router.get("/", WalletController.getWallet);
router.post("/deposit", validateBody(fundWalletSchema), WalletController.fundWallet);
router.patch("/settings", validateBody(updateSettingsSchema), WalletController.updateSettings);
router.get("/recommendation", WalletController.getRecommendation);
router.get("/transactions", WalletController.getTransactions);

export const walletRoutes = router;
