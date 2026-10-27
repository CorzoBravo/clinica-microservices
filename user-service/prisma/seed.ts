import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 [user-service] Iniciando carga de datos iniciales (Seed)...');

  // Limpiar usuarios previos para evitar duplicados en seed fresco
  await prisma.user.deleteMany({});

  const passwordHashAdmin = await bcrypt.hash('admin123', 10);
  const passwordHashDoctor = await bcrypt.hash('doctor123', 10);
  const passwordHashPatient = await bcrypt.hash('paciente123', 10);

  // 1. Crear Administrador
  const admin = await prisma.user.create({
    data: {
      email: 'admin@clinica.com',
      name: 'Administrador del Sistema',
      password: passwordHashAdmin,
      role: 'ADMIN',
    },
  });

  // 2. Crear Médicos
  const doc1 = await prisma.user.create({
    data: {
      email: 'dr.garcia@clinica.com',
      name: 'Dr. Carlos García - Cardiología',
      password: passwordHashDoctor,
      role: 'MEDICO',
    },
  });

  const doc2 = await prisma.user.create({
    data: {
      email: 'dra.lopez@clinica.com',
      name: 'Dra. Elena López - Pediatría',
      password: passwordHashDoctor,
      role: 'MEDICO',
    },
  });

  // 3. Crear Pacientes
  const paciente1 = await prisma.user.create({
    data: {
      email: 'paciente@correo.com',
      name: 'Juan Pérez',
      password: passwordHashPatient,
      role: 'PACIENTE',
    },
  });

  const paciente2 = await prisma.user.create({
    data: {
      email: 'maria@correo.com',
      name: 'María Gómez',
      password: passwordHashPatient,
      role: 'PACIENTE',
    },
  });

  console.log('✅ [user-service] Usuarios sembrados exitosamente:');
  console.log(`   👑 ADMIN:    ${admin.email} (ID: ${admin.id})`);
  console.log(`   🩺 MÉDICO:   ${doc1.email} (ID: ${doc1.id})`);
  console.log(`   🩺 MÉDICO:   ${doc2.email} (ID: ${doc2.id})`);
  console.log(`   🧑‍⚕️ PACIENTE: ${paciente1.email} (ID: ${paciente1.id})`);
  console.log(`   🧑‍⚕️ PACIENTE: ${paciente2.email} (ID: ${paciente2.id})`);
}

main()
  .catch((e) => {
    console.error('❌ Error ejecutando seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
