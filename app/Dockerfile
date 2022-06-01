FROM node:18.0-alpine AS development
EXPOSE 3000
WORKDIR /app
COPY package.json .
RUN npm i

FROM development AS production
RUN npm prune --production

FROM development AS build
COPY . .
RUN npm run build

FROM alpine:3.15 AS runtime
ENV NODE_ENV=production
WORKDIR /app
RUN addgroup -g 9999 app \
  && adduser -u 9999 -G app -h /app -s /bin/false -D app \
  && apk add --no-cache postgresql-client
COPY --from=development /usr/lib/libgcc* /usr/lib/libstdc* /usr/lib/
COPY --from=development /usr/local /usr/local
COPY --from=production /app/node_modules /app/node_modules
COPY --from=build /app/build /app
USER app
EXPOSE 3000
CMD [ "node", "." ]
