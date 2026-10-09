import express from 'express';
import cors from 'cors';
import { createProxyMiddleware } from 'http-proxy-middleware';

const app = express();
app.use(cors());

const PORT = process.env.PORT || 3000;
const USER_SERVICE_URL = process.env.USER_SERVICE_URL || 'http://localhost:3001';
const APPOINTMENT_SERVICE_URL = process.env.APPOINTMENT_SERVICE_URL || 'http://localhost:8000';

app.use('/api/users', createProxyMiddleware({
  target: USER_SERVICE_URL,
  changeOrigin: true,
  pathRewrite: {
    '^/api/users': ''
  }
}));

app.use('/api/appointments', createProxyMiddleware({
  target: APPOINTMENT_SERVICE_URL,
  changeOrigin: true,
  pathRewrite: {
    '^/api/appointments': ''
  }
}));

app.get('/health', (req, res) => {
  res.json({ status: 'API Gateway (TypeScript) is up and running' });
});

app.listen(PORT, () => {
  console.log(`API Gateway escuchando en el puerto ${PORT}`);
});
