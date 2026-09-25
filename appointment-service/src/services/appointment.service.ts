import { AppointmentRepository } from '../repositories/appointment.repository';
import { AppointmentStatus } from '@prisma/client';

const appointmentRepository = new AppointmentRepository();

export class AppointmentService {
  async create(data: any) {
    return await appointmentRepository.create({
      patientId: data.patientId,
      doctorId: data.doctorId,
      date: new Date(data.date),
      notes: data.notes,
    });
  }

  async getAll(patientId?: number, doctorId?: number) {
    const filters: any = {};
    if (patientId) filters.patientId = patientId;
    if (doctorId) filters.doctorId = doctorId;
    
    return await appointmentRepository.findMany(filters);
  }

  async updateStatus(id: number, status: AppointmentStatus) {
    const appointment = await appointmentRepository.findById(id);
    if (!appointment) {
      const error: any = new Error('Cita no encontrada');
      error.status = 404;
      throw error;
    }
    return await appointmentRepository.update(id, { status });
  }
}
