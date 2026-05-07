import { Router } from 'express'
import { requireAuth } from '../middleware/auth.middleware'
import { OnboardingController } from '../controllers/onboarding.controller'

const router = Router()

router.use(requireAuth)

router.post  ('/profile',          OnboardingController.saveProfile)
router.get   ('/wallet/challenge', OnboardingController.getWalletChallenge)
router.post  ('/wallet/verify',    OnboardingController.verifyWallet)
router.patch ('/complete',         OnboardingController.completeOnboarding)

export default router
