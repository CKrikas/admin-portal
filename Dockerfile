# ---------- build stage ----------
    FROM node:20-alpine AS build
    WORKDIR /app
    
    # Enable pnpm via Corepack (comes with Node 20)
    RUN corepack enable && corepack prepare pnpm@10.14.0 --activate
    
    # Copy only manifests first for better caching
    COPY package.json pnpm-lock.yaml ./
    RUN pnpm install --frozen-lockfile
    
    # Now copy the rest and build
    COPY . .
    RUN pnpm run build
    
    # ---------- runtime stage ----------
    FROM nginx:1.27-alpine
    COPY --from=build /app/dist /usr/share/nginx/html
    EXPOSE 80
    CMD ["nginx", "-g", "daemon off;"]
    