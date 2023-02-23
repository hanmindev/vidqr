# syntax=docker/dockerfile:1
FROM node:18-alpine


COPY . .

ENV NODE_ENV production

WORKDIR /client
RUN npm install --production
RUN npm install -g typescript
ARG REACT_APP_URL=https://vidqr.fly.dev
ARG REACT_APP_API_URL=https://vidqr.fly.dev
# ARG REACT_APP_URL=http://44.203.74.143
# ARG REACT_APP_API_URL=http://44.203.74.143

RUN npm run build

WORKDIR ../

RUN npm install --production
RUN npm install -g typescript


RUN npm run build
CMD [ "npm", "start" ]

EXPOSE 5000