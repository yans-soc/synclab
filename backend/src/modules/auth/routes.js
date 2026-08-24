import { Router } from 'express';
import * as controller from './controller.js';
import { authenticate } from '../../middleware/auth.js';
import { validate } from '../../middleware/validate.js';
import { loginSchema } from '../../validators/index.js';

const router = Router();

router.post('/login', validate(loginSchema), controller.signIn);
router.post('/logout', authenticate, controller.signOut);
router.get('/profile', authenticate, controller.profile);

export default router;
