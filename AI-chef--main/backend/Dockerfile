FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies
RUN npm ci

# Copy source
COPY . .

# Build
RUN npm run build

# Generate Prisma client
RUN npx prisma generate

# Expose port
EXPOSE 8000

# Start
CMD ["npm", "start"]