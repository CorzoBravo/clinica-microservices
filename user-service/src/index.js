const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';
const PORT = process.env.PORT || 3001;

// Endpoint: Registro de Usuario
app.post('/register', async (req, res) => {
  try {
    const { email, password, role } = req.body;

    // Verificar si el usuario ya existe
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({ error: 'El usuario ya existe' });
    }

    // Hashear la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear el usuario
    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role: role || 'PACIENTE', // Por defecto será paciente si no se especifica
      },
    });

    // Quitar la contraseña del objeto retornado
    const { password: _, ...userWithoutPassword } = newUser;

    res.status(201).json({ message: 'Usuario creado exitosamente', user: userWithoutPassword });
  } catch (error) {
    console.error('Error en el registro:', error);
    res.status(500).json({ error: 'Error interno del servidor al registrar' });
  }
});

// Endpoint: Login de Usuario
app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Buscar el usuario
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    // Verificar la contraseña
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    // Generar el token JWT
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({ message: 'Login exitoso', token, role: user.role });
  } catch (error) {
    console.error('Error en el login:', error);
    res.status(500).json({ error: 'Error interno del servidor al iniciar sesión' });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'User service is up and running' });
});

app.listen(PORT, () => {
  console.log(`User Service escuchando en el puerto ${PORT}`);
});
