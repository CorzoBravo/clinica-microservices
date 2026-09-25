FROM node:18-alpine AS builder

WORKDIR /usr/src/app

RUN apk add --no-cache openssl

COPY package*.json ./
RUN npm install

COPY . .
RUN npx prisma generate
RUN npm run build

FROM node:18-alpine

WORKDIR /usr/src/app

RUN apk add --no-cache openssl

COPY package*.json ./
RUN npm install --production

COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/node_modules/@prisma ./node_modules/@prisma
COPY prisma ./prisma

EXPOSE 8000

CMD ["sh", "-c", "npx prisma db push && npm start"]
