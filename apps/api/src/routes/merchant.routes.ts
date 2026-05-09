import { Router } from 'express'
import { requireAuth } from '../middleware/auth.middleware'
import { MerchantController } from '../controllers/merchant.controller'
import { OrderController } from '../controllers/order.controller'

const router = Router()

router.use(requireAuth)

router.get('/me', MerchantController.getMe)
router.get('/orders', OrderController.getOrders)

export default router
