# Stage 1: Build the application
FROM ubuntu:22.04 AS build-stage

RUN apt-get update && apt-get install -y \
    curl \
    gnupg \
    libglib2.0-0 \
    libnss3 \
    libnspr4 \
    libdbus-1-3 \
    libatk1.0-0 \
    libatk-bridge2.0-0 \
    libcups2 \
    libdrm2 \
    libxcb1 \
    libxkbcommon0 \
    libx11-6 \
    libxcomposite1 \
    libxdamage1 \
    libxext6 \
    libxfixes3 \
    libxrandr2 \
    libgbm1 \
    libpango-1.0-0 \
    libcairo2 \
    libasound2 \
    libatspi2.0-0 \
    && curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs \
    && npm install -g pnpm \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy all files and build the application
COPY . ./

RUN pnpm install

RUN pnpm build --preset node_server

# Expose port 3000
EXPOSE 3000

# Start the application
CMD sh -c "pnpm db:generate && pnpm db:migrate && pnpm db:push && pnpm start"