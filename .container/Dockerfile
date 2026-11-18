# syntax=docker/dockerfile:1
ARG NODE_IMAGE=node:26.13.1-bookworm-slim@sha256:5df79989ed685e09f0a98019db4cebfb22fb9df1a53c0161664a011f7ff6b0f1
FROM ${NODE_IMAGE} AS build
WORKDIR /opt/codebiz
COPY foundation/framework ./foundation/framework
RUN cd foundation/framework && npm ci --install-links=false --ignore-scripts --no-audit && npm run build
COPY packages/ui ./packages/ui
RUN cd packages/ui && npm ci --install-links=false --ignore-scripts --no-audit && npm run build
COPY packages/sdk ./packages/sdk
COPY apps/core-app ./apps/core-app
RUN cd apps/core-app && npm ci --install-links=false --ignore-scripts --no-audit && npm run typecheck && npm run build
FROM ${NODE_IMAGE} AS runtime
COPY --from=build --chown=node:node /opt/codebiz /opt/codebiz
USER node
WORKDIR /opt/codebiz/apps/core-app
ENV NODE_ENV=production
CMD ["node","src/api/server.ts"]
