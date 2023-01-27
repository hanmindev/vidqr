# syntax=docker/dockerfile:1
FROM node:18-alpine


COPY . .

ENV NODE_ENV production

WORKDIR /client
RUN npm install --production
RUN npm install -g typescript
# COPY ["package.json", "package-lock.json*", "./"]
ARG REACT_APP_URL=https://vidqr.fly.dev

RUN npm run build

WORKDIR ../

# COPY ["package.json", "package-lock.json*", "./"]
RUN npm install --production
RUN npm install -g typescript


RUN npm run build
CMD [ "npm", "start" ]

EXPOSE 8000