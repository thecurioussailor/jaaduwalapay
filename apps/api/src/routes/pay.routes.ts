import { Router } from 'express'
import { PayController } from '../controllers/pay.controller'

const router = Router()

// public routes — no auth needed, customer is paying
router.post('/build', PayController.buildTransaction)
router.post('/confirm', PayController.confirmPayment)

export default router
