FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY server/ ./server/

EXPOSE 3021
CMD ["npm", "run", "start"]