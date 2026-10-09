import request from 'supertest';
import app from '../src/app';
import jwt from 'jsonwebtoken';

// Mock appointmentService functions
jest.mock('../src/services/appointment.service', () => {
  return {
    AppointmentService: jest.fn().mockImplementation(() => {
      return {
        getById: jest.fn().mockImplementation(async (id) => {
          if (id === 1) return { id: 1, patientId: 10, doctorId: 20, status: 'SCHEDULED' }; // Cita ajena para paciente 11
          if (id === 2) return { id: 2, patientId: 11, doctorId: 20, status: 'SCHEDULED' }; // Cita propia para paciente 11
          return null;
        }),
      };
    }),
  };
});

describe('Authorization Tests - Appointments', () => {
  let tokenPacienteAjeno: string;
  let tokenPacientePropio: string;
  let tokenMedicoAjeno: string;

  beforeAll(() => {
    process.env.JWT_SECRET = 'test-secret';
    // Paciente 11 intentando acceder a cita del Paciente 10 (id cita 1)
    tokenPacienteAjeno = jwt.sign({ userId: 11, role: 'PACIENTE' }, process.env.JWT_SECRET);
    // Paciente 11 accediendo a su propia cita (id cita 2)
    tokenPacientePropio = jwt.sign({ userId: 11, role: 'PACIENTE' }, process.env.JWT_SECRET);
    // Médico 21 intentando acceder a cita del médico 20
    tokenMedicoAjeno = jwt.sign({ userId: 21, role: 'MEDICO' }, process.env.JWT_SECRET);
  });

  test('PACIENTE no debe poder leer citas ajenas', async () => {
    const res = await request(app)
      .get('/1')
      .set('Authorization', `Bearer ${tokenPacienteAjeno}`);
    
    expect(res.status).toBe(403);
    expect(res.body.error).toBe('No tienes permiso para ver esta cita');
  });

  test('PACIENTE debe poder leer sus propias citas', async () => {
    const res = await request(app)
      .get('/2')
      .set('Authorization', `Bearer ${tokenPacientePropio}`);
    
    expect(res.status).toBe(200);
    expect(res.body.id).toBe(2);
    expect(res.body.patientId).toBe(11);
  });

  test('MEDICO no debe poder leer citas que no le corresponden', async () => {
    const res = await request(app)
      .get('/1')
      .set('Authorization', `Bearer ${tokenMedicoAjeno}`);
    
    expect(res.status).toBe(403);
    expect(res.body.error).toBe('No tienes permiso para ver esta cita');
  });
});
