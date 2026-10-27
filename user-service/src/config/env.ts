// Validación temprana de variables de entorno al arrancar el servicio
if (process.env.NODE_ENV !== 'test') {
  const requiredEnv = ['DATABASE_URL', 'JWT_SECRET'] as const;
  for (const key of requiredEnv) {
    if (!process.env[key]) {
      throw new Error(`[user-service] Variable de entorno requerida no encontrada: ${key}`);
    }
  }
}

export const ENV = {
  PORT: process.env.PORT || '3001',
  DATABASE_URL: process.env.DATABASE_URL || 'postgresql://localhost:5432/clinica_db?schema=public',
  JWT_SECRET: process.env.JWT_SECRET || 'test_jwt_secret',
  NODE_ENV: process.env.NODE_ENV || 'development',
};
