import { Response, NextFunction } from 'express';
import { AppointmentService } from '../services/appointment.service';
import { AuthRequest } from '../middlewares/auth.middleware';

const appointmentService = new AppointmentService();

export const createAppointment = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const data = { ...req.body };
    const userRole = req.user?.role;
    const userId = req.user?.userId;

    if (!userId || !userRole) {
      return res.status(401).json({ error: 'No autenticado' });
    }

    // P0-6 (a): Reglas de autorización por rol al agendar cita
    if (userRole === 'PACIENTE') {
      data.patientId = userId;
    } else if (userRole === 'MEDICO') {
      if (req.body.doctorId && req.body.doctorId !== userId) {
        return res.status(403).json({ error: 'No puedes agendar citas en nombre de otro médico' });
      }
      data.doctorId = userId;
      if (!data.patientId) {
        return res.status(400).json({ error: 'patientId es requerido para que un médico agende una cita' });
      }
    } else if (userRole === 'ADMIN') {
      if (!data.patientId || !data.doctorId) {
        return res.status(400).json({ error: 'patientId y doctorId son requeridos para un administrador' });
      }
    } else {
      return res.status(403).json({ error: 'Rol no autorizado para agendar citas' });
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
    if (isNaN(id)) {
      return res.status(400).json({ error: 'ID de cita inválido' });
    }

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
    if (isNaN(id)) {
      return res.status(400).json({ error: 'ID de cita inválido' });
    }

    const { status } = req.body;
    const userRole = req.user?.role || '';
    const userId = req.user?.userId;

    // P0-6 (b): Matriz de permisos por rol para actualización de estado
    const allowedByRole: Record<string, string[]> = {
      PACIENTE: ['CANCELLED'],
      MEDICO: ['COMPLETED', 'CANCELLED'],
      ADMIN: ['COMPLETED', 'CANCELLED'],
    };

    if (!allowedByRole[userRole]?.includes(status)) {
      return res.status(403).json({ error: `Un usuario con rol ${userRole} no tiene permiso para cambiar el estado a ${status}` });
    }

    const appointment = await appointmentService.getById(id);
    if (!appointment) return res.status(404).json({ error: 'Cita no encontrada' });

    // Verificación de pertenencia / ownership
    if (userRole === 'PACIENTE' && appointment.patientId !== userId) {
      return res.status(403).json({ error: 'No tienes permiso para modificar esta cita' });
    }
    if (userRole === 'MEDICO' && appointment.doctorId !== userId) {
      return res.status(403).json({ error: 'No tienes permiso para modificar esta cita' });
    }

    const updated = await appointmentService.updateStatus(id, status);
    res.status(200).json(updated);
  } catch (error) {
    next(error);
  }
};
