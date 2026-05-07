import { Router } from 'express'
import { requireAuth } from '../middleware/auth.middleware'
import { MerchantController } from '../controllers/merchant.controller'

const router = Router()

router.use(requireAuth)

router.get('/me', MerchantController.getMe)

export default router
