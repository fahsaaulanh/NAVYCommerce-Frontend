FROM node:22-bookworm-slim AS dependencies
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
COPY package.json package-lock.json ./
RUN npm ci

FROM node:22-bookworm-slim AS build
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=dependencies /app/node_modules ./node_modules
COPY . .

# This is a public URL, not a credential. NEXT_PUBLIC values are fixed at build time.
ARG BACKEND_ORIGIN
ENV NEXT_PUBLIC_AUTH_API_URL=${BACKEND_ORIGIN}/api/Auth
ENV AUTH_API_URL=${BACKEND_ORIGIN}/api/Auth
ENV BACKEND_API_URL=${BACKEND_ORIGIN}/api
RUN test -n "$BACKEND_ORIGIN" && mkdir -p public && npm run build

FROM node:22-bookworm-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

RUN groupadd --system --gid 1001 nextjs \
    && useradd --system --uid 1001 --gid nextjs nextjs \
    && mkdir -p .next \
    && chown nextjs:nextjs .next

COPY --from=build --chown=nextjs:nextjs /app/.next/standalone ./
COPY --from=build --chown=nextjs:nextjs /app/.next/static ./.next/static
COPY --from=build --chown=nextjs:nextjs /app/public ./public

USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]
