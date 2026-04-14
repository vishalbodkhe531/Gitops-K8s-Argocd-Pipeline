FROM node:22-alpine

WORKDIR /usr/src/app

COPY package*.json ./

Run npm install

COPY . .

RUN npm run build

EXPOSE 5000

CMD ["node","dist/app.js"]