import './config/env';
import express from 'express';
import userRoutes from './routes/user.routes';
import { errorHandler } from './middlewares/error.middleware';

const app = express();

// CORS se delega exclusivamente al API Gateway en el borde para evitar cabeceras duplicadas
app.use(express.json());

// Rutas
app.use('/', userRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'User service (TypeScript) is up and running' });
});

// Manejo de errores centralizado
app.use(errorHandler);

const PORT = process.env.PORT || 3001;

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`User Service escuchando en el puerto ${PORT}`);
  });
}

export default app;
