# Dockerfile
FROM node:20

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 5001

ENV PORT=5001

CMD ["node", "app.js"]
