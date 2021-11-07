FROM node:16-alpine

ENV NODE_ENV=production

WORKDIR /app

COPY . /app

RUN apk add --update --no-cache python3 build-base

RUN yarn --frozen-lockfile && \
    yarn cache clean

EXPOSE 8080

CMD ["yarn", "prod", "--prefix", "/app"]
