import { UserRepository } from '../repositories/user.repository';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const userRepository = new UserRepository();
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';

export class UserService {
  async register(data: any) {
    const existingUser = await userRepository.findByEmail(data.email);
    if (existingUser) {
      const error: any = new Error('El usuario ya existe');
      error.status = 400;
      throw error;
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);
    const newUser = await userRepository.create({
      email: data.email,
      password: hashedPassword,
      role: data.role || 'PACIENTE',
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

    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    return { message: 'Login exitoso', token, role: user.role };
  }
}
