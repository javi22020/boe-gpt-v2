FROM node:current-alpine

WORKDIR /app

COPY . /app

ENV NODE_ENV production

RUN npm cache clean --force && \
    rm -rf node_modules .next

RUN npm install

RUN npm run build

EXPOSE 3000:3000

CMD ["npm", "start"]