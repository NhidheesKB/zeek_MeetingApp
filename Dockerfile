FROM node:22-alpine AS build
WORKDIR /build
COPY package*.json ./
RUN npm install
COPY . .

RUN npm run build


FROM node:22-alpine AS production
WORKDIR /www
COPY package*.json ./
RUN npm install
COPY --from=build /build/build /www/build
COPY --from=build /build/public /www/public
COPY cred /www/cred
RUN chmod -R 777 /www/cred

EXPOSE 3333
CMD ["node", "./build/bin/server.js"]

