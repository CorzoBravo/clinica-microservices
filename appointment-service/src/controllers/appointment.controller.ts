import { Request, Response, NextFunction } from 'express';
import { AppointmentService } from '../services/appointment.service';
import { AuthRequest } from '../middlewares/auth.middleware';

const appointmentService = new AppointmentService();

export const createAppointment = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const data = { ...req.body };
    if (req.user?.role === 'PACIENTE') {
      data.patientId = req.user.userId;
    }
    const appointment = await appointmentService.create(data);
    res.status(201).json(appointment);
  } catch (error) {
    next(error);
  }
};

export const getAppointments = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    let patientId = req.query.patientId ? Number(req.query.patientId) : undefined;
    let doctorId = req.query.doctorId ? Number(req.query.doctorId) : undefined;

    if (req.user?.role === 'PACIENTE') {
      patientId = req.user.userId;
    } else if (req.user?.role === 'MEDICO') {
      doctorId = req.user.userId;
    }

    const appointments = await appointmentService.getAll(patientId, doctorId);
    res.status(200).json(appointments);
  } catch (error) {
    next(error);
  }
};

export const getAppointmentById = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    const appointment = await appointmentService.getById(id);
    if (!appointment) return res.status(404).json({ error: 'Cita no encontrada' });

    if (req.user?.role === 'PACIENTE' && appointment.patientId !== req.user.userId) {
      return res.status(403).json({ error: 'No tienes permiso para ver esta cita' });
    }
    if (req.user?.role === 'MEDICO' && appointment.doctorId !== req.user.userId) {
      return res.status(403).json({ error: 'No tienes permiso para ver esta cita' });
    }

    res.status(200).json(appointment);
  } catch (error) {
    next(error);
  }
};

export const updateStatus = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    const { status } = req.body;

    const appointment = await appointmentService.getById(id);
    if (!appointment) return res.status(404).json({ error: 'Cita no encontrada' });

    if (req.user?.role === 'PACIENTE' && appointment.patientId !== req.user.userId) {
      return res.status(403).json({ error: 'No tienes permiso para modificar esta cita' });
    }
    if (req.user?.role === 'MEDICO' && appointment.doctorId !== req.user.userId) {
      return res.status(403).json({ error: 'No tienes permiso para modificar esta cita' });
    }

    const updated = await appointmentService.updateStatus(id, status);
    res.status(200).json(updated);
  } catch (error) {
    next(error);
  }
};
