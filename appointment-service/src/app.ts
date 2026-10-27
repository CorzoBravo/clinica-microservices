import './config/env';
import express from 'express';
import appointmentRoutes from './routes/appointment.routes';
import { errorHandler } from './middlewares/error.middleware';

const app = express();

app.use(express.json());

app.use('/', appointmentRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'Appointment service (TypeScript) is up and running' });
});

app.use(errorHandler);

const PORT = Number(process.env.PORT) || 8000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Appointment Service escuchando en el puerto ${PORT}`);
});

export default app;
