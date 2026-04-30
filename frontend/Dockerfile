FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install @rolldown/binding-linux-x64-musl --save-optional
RUN npm install
COPY . .