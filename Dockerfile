FROM ghcr.io/puppeteer/puppeteer:22.6.4

USER root

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN chown -R pptruser:pptruser /app

USER pptruser

ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome

EXPOSE 3001

CMD ["node", "server.js"]
