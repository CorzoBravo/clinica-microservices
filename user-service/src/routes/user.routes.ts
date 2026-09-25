import { Router } from 'express';
import { registerUser, loginUser } from '../controllers/user.controller';
import { validate } from '../middlewares/validate.middleware';
import { z } from 'zod';

const router = Router();

const authSchema = z.object({
  body: z.object({
    email: z.string().email('Debe ser un email válido'),
    password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
    role: z.enum(['ADMIN', 'MEDICO', 'PACIENTE']).optional(),
  }),
});

router.post('/register', validate(authSchema), registerUser);
router.post('/login', validate(authSchema), loginUser);

export default router;
