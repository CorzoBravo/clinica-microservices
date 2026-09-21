const express = require('express');
const cors = require('cors');
const proxy = require('express-http-proxy');

const app = express();
app.use(cors());

const PORT = process.env.PORT || 3000;
const USER_SERVICE_URL = process.env.USER_SERVICE_URL || 'http://localhost:3001';
const APPOINTMENT_SERVICE_URL = process.env.APPOINTMENT_SERVICE_URL || 'http://localhost:8000';

// Proxy para el servicio de usuarios
app.use('/api/users', proxy(USER_SERVICE_URL, {
  proxyReqPathResolver: function (req) {
    return req.url;
  }
}));

// Proxy para el servicio de citas (Python)
app.use('/api/appointments', proxy(APPOINTMENT_SERVICE_URL, {
  proxyReqPathResolver: function (req) {
    return req.url;
  }
}));

// Health check global
app.get('/health', (req, res) => {
  res.json({ status: 'API Gateway is up and running' });
});

app.listen(PORT, () => {
  console.log(`API Gateway escuchando en el puerto ${PORT}`);
});
