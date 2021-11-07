FROM node:16

ENV NODE_ENV=production

WORKDIR /app

COPY . /app

RUN yarn --frozen-lockfile && \
    yarn cache clean

EXPOSE 8080

CMD ["yarn", "prod", "--prefix", "/app"]
