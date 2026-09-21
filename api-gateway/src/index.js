const express = require('express');
const cors = require('cors');
const proxy = require('express-http-proxy');

const app = express();
app.use(cors());

const PORT = process.env.PORT || 3000;
const USER_SERVICE_URL = process.env.USER_SERVICE_URL || 'http://localhost:3001';

// Proxy para el servicio de usuarios
app.use('/api/users', proxy(USER_SERVICE_URL, {
  proxyReqPathResolver: function (req) {
    // Si la request viene a /api/users/register, la redirige a /register en user-service
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
