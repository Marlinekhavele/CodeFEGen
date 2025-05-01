# Use the same Node version as your local environment
FROM node:22-alpine

# Set working directory
WORKDIR /app

# Install the same pnpm version as your local environment
RUN npm install -g pnpm@10.9.0

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Verify versions match your local environment
RUN echo "Node $(node -v), NPM $(npm -v), PNPM $(pnpm -v)"

# Install dependencies
RUN pnpm install

# Copy all project files
COPY . .

# Ensure postcss.config.js exists
RUN [ -f postcss.config.js ] || echo "module.exports = { plugins: { tailwindcss: {}, autoprefixer: {} } }" > postcss.config.js

# Clean the Next.js cache
RUN rm -rf .next

# Set environment variables
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Build the application
RUN pnpm build

# Debug: Verify CSS files
RUN find .next -name "*.css" || echo "No CSS files found"
RUN ls -la .next/static/css/ || echo "No CSS directory"

# Debug: Check CSS content (to verify it's not empty)
RUN cat .next/static/css/*.css | head -n 20 || echo "No CSS content"

# Expose port and start the application
EXPOSE 3000
ENV PORT=3000

CMD ["pnpm", "start"]