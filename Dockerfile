FROM node:6

# Include backend deps
COPY backend/package.json /usr/src/backend/

# Navigate to backend path
WORKDIR /usr/src/backend

# Install backend dependencies
RUN npm install --quiet --unsafe-perm


# Include frontend deps
COPY frontend/package.json /usr/src/frontend/

# Navigate to frontend path
WORKDIR /usr/src/frontend

# Install frontend dependencies
RUN npm install --quiet --unsafe-perm


# Navigate to root path and copy all sources
WORKDIR /usr/src
COPY ./backend /usr/src/backend
COPY ./frontend /usr/src/frontend
COPY ./common /usr/src/common


# Navigate to frontend and build app
WORKDIR /usr/src/frontend
RUN npm run build && \
	mkdir -p ../backend/public && \
	cp -r dist/* ../backend/public && \
	cp -r static/* ../backend/public


ENV PORT=3000
EXPOSE 3000

# Navigate to backend app
WORKDIR /usr/src/backend

CMD ["node", "app.js"]
