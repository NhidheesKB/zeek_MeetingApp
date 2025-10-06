FROM node:22-alpine AS build
WORKDIR /build
COPY . .
RUN npm install && npm run build


FROM node:22-alpine AS production
WORKDIR /www/build
COPY --from=build /build/build ./
COPY --from=build /build/build/public /www/public
COPY cred ./cred
COPY .puppeteerrc.cjs ./
RUN mkdir -p ./storage/tmp
RUN mkdir -p ./.cache/puppeteer
RUN chmod -R 777 ./cred && chmod -R 777 ./storage && chmod -R 777 ./.cache
COPY package*.json ./
RUN  npx puppeteer browsers install  && npm ci --omit="dev"

EXPOSE 3333
CMD ["node", "./bin/server.js"]