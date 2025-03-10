FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

# Copy server files (including .env file)
COPY server/ ./server/

EXPOSE 3021
CMD ["node", "./server/index.js"]