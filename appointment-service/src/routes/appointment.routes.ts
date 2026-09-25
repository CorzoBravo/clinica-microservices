import { Router } from 'express';
import { createAppointment, getAppointments, updateStatus } from '../controllers/appointment.controller';
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

router.post('/', validate(createSchema), createAppointment);
router.get('/', getAppointments);
router.patch('/:id/status', validate(updateStatusSchema), updateStatus);

export default router;
