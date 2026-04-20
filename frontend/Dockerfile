# Use official Node.js runtime as a parent image
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files and install all dependencies
COPY package.json package-lock.json ./
RUN npm install

# Copy source code and build
COPY . .
RUN npm run build

# Runner stage for smaller image size
FROM node:20-alpine AS runner
WORKDIR /app

# Only copy over the necessary files for production
COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public

# Expose port (Cloud Run sets the PORT environment variable, defaulting to 3000 locally)
ENV PORT=3000
EXPOSE 3000

# Start the Next.js production server
CMD ["npm", "start"]
