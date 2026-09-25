import express from 'express';
import cors from 'cors';
import appointmentRoutes from './routes/appointment.routes';
import { errorHandler } from './middlewares/error.middleware';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/', appointmentRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'Appointment service (TypeScript) is up and running' });
});

app.use(errorHandler);

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log(`Appointment Service escuchando en el puerto ${PORT}`);
});
