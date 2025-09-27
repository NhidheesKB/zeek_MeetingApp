FROM node:22-alpine AS build
WORKDIR /build
COPY . .
RUN npm install && npm run build


FROM node:22-alpine AS production
WORKDIR /www/build
RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    harfbuzz \
    ca-certificates \
    ttf-freefont
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser
ENV PUPPETEER_SKIP_DOWNLOAD=true
COPY --from=build /build/build ./
COPY --from=build /build/build/public /www/public
COPY cred ./cred
RUN mkdir -p ./storage/tmp
RUN chmod -R 777 ./cred && chmod -R 777 ./storage
COPY package*.json ./
RUN npm ci --omit="dev"

EXPOSE 3333
CMD ["node", "./bin/server.js"]

