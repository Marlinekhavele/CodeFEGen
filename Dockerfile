# Use Node.js base image
FROM node:23-alpine AS base

# Set working directory
WORKDIR /app

# Install pnpm globally
RUN npm install -g pnpm

# Copy the entire project early (fixes stale file issue)
COPY . .

# Install dependencies
FROM base AS deps
RUN pnpm install

# Build the application
FROM deps AS build

# Debug to confirm file update
RUN cat /app/src/app/create-backend/backend-editor/editor/page.tsx | grep docs || echo "docs line not found"

# Optional: create placeholder components
RUN mkdir -p /app/src/components/ai-chat && \
    echo 'import React from "react"; export default function AiChat() { return <div>AI Chat Placeholder</div>; }' > /app/src/components/ai-chat/index.tsx

RUN mkdir -p /app/src/components/ui/use-toast && \
    echo 'export const useToast = () => ({ toast: () => {} }); export default useToast;' > /app/src/components/ui/use-toast/index.tsx

RUN mkdir -p /app/src/components/project-header && \
    echo 'import React from "react"; export default function ProjectHeader() { return <div>Project Header Placeholder</div>; }' > /app/src/components/project-header/index.tsx

RUN mkdir -p /app/src/components/project-files && \
    echo 'import React from "react"; export default function ProjectFiles() { return <div>Project Files Placeholder</div>; }' > /app/src/components/project-files/index.tsx

RUN mkdir -p /app/src/components/file-content && \
    echo 'import React from "react"; export default function FileContent() { return <div>File Content Placeholder</div>; }' > /app/src/components/file-content/index.tsx

# Build the app
RUN pnpm build

# Final minimal image
FROM base AS final

WORKDIR /app

COPY --from=build /app/package.json ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/.next ./.next
COPY --from=build /app/public ./public

EXPOSE 3000
ENV PORT=3000
ENV NODE_ENV=production
CMD ["pnpm", "start"]
