FROM node:20-bookworm-slim AS build
WORKDIR /app
COPY client/package.json client/package-lock.json ./
RUN npm ci --no-audit --no-fund
COPY client/ ./
RUN npm run build

FROM nginx:1.27-alpine
COPY --from=build /app/dist /usr/share/nginx/html
RUN rm -rf /etc/nginx/conf.d/default.conf
COPY client/nginx.conf /etc/nginx/conf.d/
EXPOSE 5173
CMD ["nginx", "-g", "daemon off;"]
