FROM node:18-alpine

RUN apk add --no-cache openssl

WORKDIR /usr/src/app

# Copiamos primero package.json
COPY package*.json ./

# Instalamos dependencias
RUN npm install

# Copiamos el resto de los archivos, incluyendo el schema de prisma
COPY . .

# Generamos el cliente de Prisma
RUN npx prisma generate

# Exponemos el puerto
EXPOSE 3001

# Ejecutamos las migraciones (solo para desarrollo/demo, en prod se maneja distinto) y luego levantamos
CMD ["sh", "-c", "npx prisma db push && npm start"]
