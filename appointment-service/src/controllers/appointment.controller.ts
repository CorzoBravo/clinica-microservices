import { Request, Response, NextFunction } from 'express';
import { AppointmentService } from '../services/appointment.service';

const appointmentService = new AppointmentService();

export const createAppointment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const appointment = await appointmentService.create(req.body);
    res.status(201).json(appointment);
  } catch (error) {
    next(error);
  }
};

export const getAppointments = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { patientId, doctorId } = req.query;
    const appointments = await appointmentService.getAll(
      patientId ? Number(patientId) : undefined,
      doctorId ? Number(doctorId) : undefined
    );
    res.status(200).json(appointments);
  } catch (error) {
    next(error);
  }
};

export const updateStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    const { status } = req.body;
    const updated = await appointmentService.updateStatus(id, status);
    res.status(200).json(updated);
  } catch (error) {
    next(error);
  }
};
