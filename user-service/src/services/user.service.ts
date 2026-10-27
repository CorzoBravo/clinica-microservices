import { UserRepository } from '../repositories/user.repository';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const userRepository = new UserRepository();

export class UserService {
  async register(data: any, requestorRole?: string) {
    const existingUser = await userRepository.findByEmail(data.email);
    if (existingUser) {
      const error: any = new Error('El usuario ya existe');
      error.status = 400;
      throw error;
    }

    // Force role to PACIENTE if not created by ADMIN
    let finalRole: any = 'PACIENTE';
    if (requestorRole === 'ADMIN' && data.role) {
      finalRole = data.role;
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);
    const newUser = await userRepository.create({
      email: data.email,
      password: hashedPassword,
      name: data.name || null,
      role: finalRole,
    });

    const { password, ...userWithoutPassword } = newUser;
    return userWithoutPassword;
  }

  async login(data: any) {
    const user = await userRepository.findByEmail(data.email);
    if (!user) {
      const error: any = new Error('Credenciales inválidas');
      error.status = 401;
      throw error;
    }

    const passwordMatch = await bcrypt.compare(data.password, user.password);
    if (!passwordMatch) {
      const error: any = new Error('Credenciales inválidas');
      error.status = 401;
      throw error;
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error('JWT_SECRET is missing');
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      jwtSecret,
      { expiresIn: '24h' }
    );

    return { message: 'Login exitoso', token, role: user.role };
  }

  async getAll(roleFilter?: string) {
    const filters = roleFilter ? { role: roleFilter } : {};
    const users = await userRepository.findMany(filters);
    return users.map(({ password, ...user }) => user);
  }

  async getDoctors() {
    const doctors = await userRepository.findMany({ role: 'MEDICO' });
    return doctors.map(doc => ({ id: doc.id, email: doc.email, name: doc.name }));
  }

  // P0-5: Solo permite actualizar campos whitelisted (name, email).
  // La contraseña y rol requieren flujos y endpoints dedicados.
  async update(id: number, data: { name?: string; email?: string }) {
    const updateData: { name?: string; email?: string } = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.email !== undefined) updateData.email = data.email;

    const updatedUser = await userRepository.update(id, updateData);
    const { password, ...userWithoutPassword } = updatedUser;
    return userWithoutPassword;
  }
}
