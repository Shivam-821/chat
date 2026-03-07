FROM oven/bun:alpine

WORKDIR /app

COPY package.json bun.lock ./

RUN bun install

COPY . .

EXPOSE 3001

CMD [ "bun", "run", "start" ]