FROM node:16
WORKDIR /opt/app

RUN chown -R node:node /opt/app
USER node

ARG NPM_TOKEN
RUN echo "//registry.npmjs.org/:_authToken=$NPM_TOKEN" > .npmrc

COPY --chown=node:node package*.json ./
RUN npm install

COPY --chown=node:node . /opt/app

ADD "https://www.random.org/cgi-bin/randbyte?nbytes=10&format=h" skipcache

ARG ENV
RUN npm run lint && npm run build:$ENV

CMD [ "npm", "run", "start" ]

EXPOSE 3000
