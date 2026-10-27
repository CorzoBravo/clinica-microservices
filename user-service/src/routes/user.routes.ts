import { Router } from 'express';
import { registerUser, loginUser, getAllUsers, getDoctors, updateUser } from '../controllers/user.controller';
import { validate } from '../middlewares/validate.middleware';
import { authenticateJWT, authorize, optionalAuth } from '../middlewares/auth.middleware';
import { z } from 'zod';

const router = Router();

const authSchema = z.object({
  body: z.object({
    email: z.string().email('Debe ser un email válido'),
    password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
    name: z.string().max(120, 'El nombre no debe superar los 120 caracteres').optional(),
    role: z.enum(['ADMIN', 'MEDICO', 'PACIENTE']).optional(),
  }),
});

// P0-5: Whitelist estricta contra mass assignment. Rechaza role, password, id, etc.
const updateUserSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'El nombre no puede estar vacío').max(120, 'El nombre no debe superar los 120 caracteres').optional(),
    email: z.string().email('Debe ser un email válido').optional(),
  }).strict(),
});

router.post('/register', optionalAuth, validate(authSchema), registerUser);
router.post('/login', validate(authSchema), loginUser);

router.get('/', authenticateJWT, authorize(['ADMIN']), getAllUsers);
router.get('/doctors', authenticateJWT, getDoctors);
router.patch('/:id', authenticateJWT, authorize(['ADMIN']), validate(updateUserSchema), updateUser);

export default router;
