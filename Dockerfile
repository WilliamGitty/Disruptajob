# Disruptajob — production image.
#
# Node 22 specifically, because the app uses `node:sqlite`, which ships with Node 22+. That's what
# keeps the dependency count at zero: no native module to compile, no database service to pay for.
#
# Multi-stage so the runtime image carries only the standalone server output, not the toolchain.

# --- deps ------------------------------------------------------------------
FROM node:22-slim AS deps
WORKDIR /app
COPY package.json package-lock.json ./
# `npm ci` for a byte-identical install from the lockfile.
RUN npm ci

# --- build -----------------------------------------------------------------
FROM node:22-slim AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# --- runtime ---------------------------------------------------------------
FROM node:22-slim AS runtime
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# The database lives on a mounted volume, not in the image — an image rebuild must never be able
# to take the data with it.
ENV DISRUPTAJOB_DB=/data/disruptajob.db

# Run as a non-root user: a web process has no business being able to modify its own code.
RUN useradd --system --uid 1001 --create-home app

COPY --from=build /app/public ./public
COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static
# Read at runtime by the migration/seed step, so it has to be in the image.
COPY --from=build /app/src/server/schema.sql ./src/server/schema.sql

RUN mkdir -p /data && chown -R app:app /data /app
USER app

EXPOSE 3000
CMD ["node", "server.js"]
