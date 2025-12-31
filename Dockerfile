# Use Node 20
FROM node:20-slim AS builder
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source
COPY . .

# --- EMERGENCY FIX: Dummy variables for build-time ---
ENV VERTEX_API_KEY="dummy"
ENV GOOGLE_APPLICATION_CREDENTIALS="dummy"
ENV GCP_PROJECT_ID="dummy"
ENV LEMONFOX_API_KEY="dummy"
ENV GMAIL_ADDRESS="dummy"
ENV GMAIL_APP_PASSWORD="dummy"
ENV PUBLIC_SUPABASE_URL="dummy"
ENV PUBLIC_SUPABASE_ANON_KEY="dummy"
ENV SUPABASE_SERVICE_ROLE_KEY="dummy"
# -----------------------------------------------------

RUN npm run build

# Production stage
FROM node:20-slim
WORKDIR /app
COPY --from=builder /app/build ./build
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000
CMD ["node", "build/index.js"]