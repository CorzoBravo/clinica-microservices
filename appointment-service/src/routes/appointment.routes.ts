import { Router } from 'express';
import { createAppointment, getAppointments, getAppointmentById, updateStatus } from '../controllers/appointment.controller';
import { validate } from '../middlewares/validate.middleware';
import { authenticateJWT } from '../middlewares/auth.middleware';
import { z } from 'zod';

const router = Router();

const createSchema = z.object({
  body: z.object({
    patientId: z.number().int().positive().optional(), // Opcional para PACIENTE (se extrae del token)
    doctorId: z.number().int().positive({ message: 'doctorId debe ser un entero positivo' }),
    date: z.string().datetime({ message: 'date debe ser una fecha en formato ISO 8601 UTC' }),
    notes: z.string().max(500, 'Las notas no pueden superar 500 caracteres').optional(),
  }),
});

const updateStatusSchema = z.object({
  body: z.object({
    status: z.enum(['SCHEDULED', 'CANCELLED', 'COMPLETED']),
  }),
});

router.post('/', authenticateJWT, validate(createSchema), createAppointment);
router.get('/', authenticateJWT, getAppointments);
router.get('/:id', authenticateJWT, getAppointmentById);
router.patch('/:id/status', authenticateJWT, validate(updateStatusSchema), updateStatus);

export default router;
