import './config/env';
import express from 'express';
import userRoutes from './routes/user.routes';
import { errorHandler } from './middlewares/error.middleware';

const app = express();

app.use(express.json());

// Rutas
app.use('/', userRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'User service (TypeScript) is up and running' });
});

// Manejo de errores centralizado
app.use(errorHandler);

const PORT = Number(process.env.PORT) || 3001;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`User Service escuchando en el puerto ${PORT}`);
});

export default app;
