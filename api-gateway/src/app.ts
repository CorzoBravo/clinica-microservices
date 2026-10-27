import express, { Request, Response } from 'express';
import cors from 'cors';
import { createProxyMiddleware } from 'http-proxy-middleware';

const app = express();

// CORS configurado centralizadamente en el API Gateway
app.use(cors());

const PORT = process.env.PORT || 3000;
const USER_SERVICE_URL = process.env.USER_SERVICE_URL || 'http://localhost:3001';
const APPOINTMENT_SERVICE_URL = process.env.APPOINTMENT_SERVICE_URL || 'http://localhost:8000';

// Proxy para microservicio de Usuarios
app.use('/api/users', createProxyMiddleware({
  target: USER_SERVICE_URL,
  changeOrigin: true,
  pathRewrite: {
    '^/api/users': ''
  },
  onError: (err, req, res) => {
    console.error(`[API Gateway] Error comunicando con user-service: ${err.message}`);
    (res as Response).status(502).json({
      error: 'Servicio no disponible (502 Bad Gateway)',
      message: 'No se pudo conectar con el servicio de usuarios'
    });
  }
}));

// Proxy para microservicio de Citas
app.use('/api/appointments', createProxyMiddleware({
  target: APPOINTMENT_SERVICE_URL,
  changeOrigin: true,
  pathRewrite: {
    '^/api/appointments': ''
  },
  onError: (err, req, res) => {
    console.error(`[API Gateway] Error comunicando con appointment-service: ${err.message}`);
    (res as Response).status(502).json({
      error: 'Servicio no disponible (502 Bad Gateway)',
      message: 'No se pudo conectar con el servicio de citas'
    });
  }
}));

app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'API Gateway (TypeScript) is up and running' });
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`API Gateway escuchando en el puerto ${PORT}`);
  });
}

export default app;
