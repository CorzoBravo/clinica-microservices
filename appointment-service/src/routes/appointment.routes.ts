import { Router } from 'express';
import { createAppointment, getAppointments, getAppointmentById, updateStatus } from '../controllers/appointment.controller';
import { validate } from '../middlewares/validate.middleware';
import { z } from 'zod';

const router = Router();

const createSchema = z.object({
  body: z.object({
    patientId: z.number(),
    doctorId: z.number(),
    date: z.string().datetime(),
    notes: z.string().optional(),
  }),
});

const updateStatusSchema = z.object({
  body: z.object({
    status: z.enum(['SCHEDULED', 'CANCELLED', 'COMPLETED']),
  }),
});

import { authenticateJWT } from '../middlewares/auth.middleware';

router.post('/', authenticateJWT, validate(createSchema), createAppointment);
router.get('/', authenticateJWT, getAppointments);
router.get('/:id', authenticateJWT, getAppointmentById);
router.patch('/:id/status', authenticateJWT, validate(updateStatusSchema), updateStatus);

export default router;
