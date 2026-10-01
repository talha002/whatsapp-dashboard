FROM node:24-alpine AS build
WORKDIR /app/dashboard
ARG VITE_APP_TITLE="whatsapp-dashboard"
ARG VITE_DATA_URL="/chat-data.json"
ENV VITE_APP_TITLE=$VITE_APP_TITLE
ENV VITE_DATA_URL=$VITE_DATA_URL
COPY dashboard/package.json dashboard/package-lock.json ./
RUN npm ci
COPY dashboard/tsconfig.json dashboard/vite.config.ts dashboard/index.html ./
COPY dashboard/shared ./shared
COPY dashboard/src ./src
RUN npm run build

FROM node:24-alpine
ENV NODE_ENV=production
ENV PORT=8080
ENV STATIC_DIR=/app/dist
WORKDIR /app
COPY --from=build /app/dashboard/dist ./dist
COPY dashboard/scripts/serve.mjs ./scripts/serve.mjs
USER node
EXPOSE 8080
CMD ["node", "scripts/serve.mjs"]
