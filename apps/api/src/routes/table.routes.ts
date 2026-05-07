import { Router } from 'express'
import { requireAuth } from '../middleware/auth.middleware'
import { TableController } from '../controllers/table.controller'

const router = Router()

router.use(requireAuth)

router.get   ('/',             TableController.getTables)
router.post  ('/',             TableController.createTable)
router.delete('/:tableId',     TableController.deleteTable)

export default router
