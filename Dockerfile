# -------------------
# Base image with Node and pnpm
# -------------------
    FROM node:20-alpine AS base

    # Set working directory
    WORKDIR /app
    
    # Install pnpm globally
    RUN npm install -g pnpm
    
    # -------------------
    # Dependencies layer
    # -------------------
    FROM base AS deps
    
    # Copy package manager files
    COPY package.json pnpm-lock.yaml ./
    
    # Install dependencies
    RUN pnpm install
    
    # -------------------
    # Build layer
    # -------------------
    FROM deps AS build
    
    # Copy rest of the application code
    COPY . .
    
    # Set build environment
    ENV NEXT_TELEMETRY_DISABLED=1
    ENV NODE_ENV=production
    ENV HUSKY=0
    
    # Ensure latest Next.js is installed
    RUN pnpm add -D next@latest
    
    # Build the application
    RUN pnpm build
    
    # -------------------
    # Final runtime image
    # -------------------
    FROM base AS final
    
    # Set working directory
    WORKDIR /app
    
    # Copy everything needed from build stage
    COPY --from=build /app ./
    
    # Optionally prune devDependencies to slim image
    # RUN pnpm prune --prod
    
    # Expose port and start app
    EXPOSE 3000
    ENV PORT=3000
    ENV NODE_ENV=production
    
    CMD ["pnpm", "start"]
    