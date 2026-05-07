import { Router } from 'express'
import { requireAuth } from '../middleware/auth.middleware'
import { MenuController } from '../controllers/menu.controller'

const router = Router()

router.use(requireAuth)

router.get   ('/',                          MenuController.getMenu)
router.post  ('/categories',                MenuController.createCategory)
router.delete('/categories/:categoryId',    MenuController.deleteCategory)
router.post  ('/items',                     MenuController.createItem)
router.patch ('/items/:itemId',             MenuController.updateItem)
router.delete('/items/:itemId',             MenuController.deleteItem)

export default router
