FROM node:22-alpine AS build
WORKDIR /build
COPY . .
RUN npm install && npm run build


FROM node:22-alpine AS production
WORKDIR /www/build
COPY --from=build /build/build ./
COPY --from=build /build/build/public /www/public
COPY cred ./cred
RUN mkdir -p ./storage/tmp
RUN chmod -R 777 /www/cred && chmod -R 777 ./storage
RUN npm ci --omit="dev"

EXPOSE 3333
CMD ["node", "./bin/server.js"]

