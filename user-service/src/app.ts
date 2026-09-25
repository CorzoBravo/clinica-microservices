import express from 'express';
import cors from 'cors';
import userRoutes from './routes/user.routes';
import { errorHandler } from './middlewares/error.middleware';

const app = express();

app.use(cors());
app.use(express.json());

// Rutas
app.use('/', userRoutes); // Las rutas de gateway vienen a / (ej. /api/users/register -> /register)

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'User service (TypeScript) is up and running' });
});

// Manejo de errores centralizado
app.use(errorHandler);

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`User Service escuchando en el puerto ${PORT}`);
});
