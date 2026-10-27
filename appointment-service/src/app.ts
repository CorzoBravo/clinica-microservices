import './config/env';
import express from 'express';
import appointmentRoutes from './routes/appointment.routes';
import { errorHandler } from './middlewares/error.middleware';

const app = express();

// CORS se delega exclusivamente al API Gateway en el borde para evitar cabeceras duplicadas
app.use(express.json());

app.use('/', appointmentRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'Appointment service (TypeScript) is up and running' });
});

app.use(errorHandler);

const PORT = process.env.PORT || 8000;

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Appointment Service escuchando en el puerto ${PORT}`);
  });
}

export default app;
