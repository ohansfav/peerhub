FROM node:18-alpine

WORKDIR /app

COPY server/package*.json ./

RUN npm ci --omit=dev

COPY server/src ./src
COPY server/.env.production ./.env.production

EXPOSE 3000

CMD ["node", "src/server.js"]
