FROM node:20-alpine

WORKDIR /app

# Copy and install root dependencies
COPY package*.json ./
RUN npm install

# Copy server files
COPY server/ ./server/

# Install server dependencies
WORKDIR /app/server
RUN npm install

# Set working directory back to root for CMD
WORKDIR /app

EXPOSE 3021
CMD ["node", "./server/index.js"]