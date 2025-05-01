# Single-stage Dockerfile (simpler approach)
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install all dependencies
RUN pnpm install

# Copy all project files
COPY . .

# Create postcss.config.js if it doesn't exist
RUN [ -f postcss.config.js ] || echo "module.exports = { plugins: { tailwindcss: {}, autoprefixer: {} } }" > postcss.config.js

# Debug: Show environment
RUN echo "Node version: $(node -v) && NPM version: $(npm -v) && PNPM version: $(pnpm -v)"

# Clean the Next.js cache
RUN rm -rf .next

# Build the application (do NOT add -D next@latest)
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
RUN pnpm build

# Debug: Check for CSS files
RUN find .next -name "*.css" || echo "No CSS files found"
RUN ls -la .next/static/ || echo "No static directory"

# Expose port and start the application
EXPOSE 3000
ENV PORT=3000

CMD ["pnpm", "start"]