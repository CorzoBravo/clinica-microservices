import prisma from '../config/db';
import { Prisma, Appointment } from '@prisma/client';

export class AppointmentRepository {
  async create(data: Prisma.AppointmentCreateInput): Promise<Appointment> {
    return prisma.appointment.create({ data });
  }

  async findMany(filters: any): Promise<Appointment[]> {
    return prisma.appointment.findMany({ where: filters });
  }

  async findById(id: number): Promise<Appointment | null> {
    return prisma.appointment.findUnique({ where: { id } });
  }

  async update(id: number, data: Prisma.AppointmentUpdateInput): Promise<Appointment> {
    return prisma.appointment.update({ where: { id }, data });
  }
}
