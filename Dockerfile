# Use the same Node version as your local environment
FROM node:22-alpine

# Set working directory
WORKDIR /app

# Install the same pnpm version as your local environment
RUN npm install -g pnpm

# Copy package files
COPY package.json pnpm-lock.yaml ./


# Install dependencies
RUN pnpm install

# Copy all project files
COPY . .

# Clean the Next.js cache
RUN rm -rf .next

# Set environment variables
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Build the application
RUN pnpm build


# Expose port and start the application
EXPOSE 3000
ENV PORT=3000

CMD ["pnpm", "start"]