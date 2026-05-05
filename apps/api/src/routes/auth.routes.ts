import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";

const router = Router();

router.post('/merchant/register', AuthController.register)
router.post('/merchant/login', AuthController.login)

export default router;