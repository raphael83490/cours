# Use the official Puppeteer Docker image which has Chrome and all dependencies pre-installed
FROM ghcr.io/puppeteer/puppeteer:22.6.4

# Use root to install dependencies and configure app
USER root

WORKDIR /app

# Copy package files and install
COPY package*.json ./
RUN npm install

# Copy source files
COPY . .

# Set permissions so the puppeteer user can write auth and logs
RUN chown -R pptruser:pptruser /app

# Use pptruser
USER pptruser

ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome \
    PORT=3001

EXPOSE 3001

CMD ["node", "server.js"]
