import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 [appointment-service] Iniciando carga de datos iniciales (Seed)...');

  // Limpiar citas previas para pruebas limpias
  await prisma.appointment.deleteMany({});

  // Fechas relativas
  const todayAt10 = new Date();
  todayAt10.setHours(10, 0, 0, 0);

  const tomorrowAt15 = new Date();
  tomorrowAt15.setDate(tomorrowAt15.getDate() + 1);
  tomorrowAt15.setHours(15, 30, 0, 0);

  const pastDate = new Date();
  pastDate.setDate(pastDate.getDate() - 3);
  pastDate.setHours(9, 0, 0, 0);

  // 1. Cita completada anterior
  await prisma.appointment.create({
    data: {
      patientId: 1, // Juan Pérez
      doctorId: 2,  // Dr. Carlos García
      date: pastDate,
      status: 'COMPLETED',
      notes: 'Chequeo cardiológico anual. Presión arterial 120/80 mmHg.',
    },
  });

  // 2. Cita pendiente para hoy
  await prisma.appointment.create({
    data: {
      patientId: 1, // Juan Pérez
      doctorId: 3,  // Dra. Elena López
      date: todayAt10,
      status: 'SCHEDULED',
      notes: 'Consulta de control general y revisión de análisis.',
    },
  });

  // 3. Cita pendiente para mañana
  await prisma.appointment.create({
    data: {
      patientId: 2, // María Gómez
      doctorId: 2,  // Dr. Carlos García
      date: tomorrowAt15,
      status: 'SCHEDULED',
      notes: 'Evaluación de dolor torácico leve recurrente.',
    },
  });

  console.log('✅ [appointment-service] Citas médicas sembradas exitosamente.');
}

main()
  .catch((e) => {
    console.error('❌ Error ejecutando seed de citas:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
