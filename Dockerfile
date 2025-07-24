# Use official Node.js 20 slim image
FROM node:20-slim

# Install dependencies and tools
RUN apt-get update && apt-get install -y \
  wget \
  curl \
  gnupg \
  ca-certificates \
  fonts-liberation \
  libappindicator3-1 \
  libasound2 \
  libatk-bridge2.0-0 \
  libatk1.0-0 \
  libcups2 \
  libdbus-1-3 \
  libgdk-pixbuf2.0-0 \
  libnspr4 \
  libnss3 \
  libx11-xcb1 \
  libxcomposite1 \
  libxdamage1 \
  libxrandr2 \
  xdg-utils \
  libgbm-dev \
  libxshmfence-dev \
  tesseract-ocr \
  unzip \
  lsb-release \
  && apt-get clean && rm -rf /var/lib/apt/lists/*

# Add Chrome repo and install Google Chrome stable
RUN curl -sSL https://dl.google.com/linux/linux_signing_key.pub | gpg --dearmor > /usr/share/keyrings/google.gpg && \
    echo "deb [arch=amd64 signed-by=/usr/share/keyrings/google.gpg] http://dl.google.com/linux/chrome/deb/ stable main" > /etc/apt/sources.list.d/google.list && \
    apt-get update && apt-get install -y google-chrome-stable && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Install Node dependencies
COPY package*.json ./
RUN npm install

# Copy application source code
COPY . .

# Puppeteer with system Chrome
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV NODE_ENV=production

# Expose port (for Cloud Run)
EXPOSE 8080

# Run the server
CMD ["node", "server.js"]
