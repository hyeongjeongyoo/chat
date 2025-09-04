# 1. Base Image
FROM node:22.14.0-slim AS base

# 2. Set working directory
WORKDIR /usr/src/app

# 3. Install pnpm
RUN npm install -g pnpm

# 4. Copy package.json and pnpm-lock.yaml
COPY package.json pnpm-lock.yaml ./

# 5. Install dependencies
RUN pnpm install --frozen-lockfile

# 6. Copy source code
COPY . .

# 7. Build the application
RUN pnpm build

# 8. Start the application
CMD ["pnpm", "start"] 