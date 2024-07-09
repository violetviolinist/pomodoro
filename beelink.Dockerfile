# Use the official Node.js image with Alpine Linux
FROM node:22-alpine

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json (if available)
COPY package*.json ./
COPY public public
COPY server.js server.js
COPY routes routes

# Install the Node.js dependencies
RUN npm install --production

# Command to run the application
CMD ["node", "server.js"]