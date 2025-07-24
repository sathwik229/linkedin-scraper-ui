# Use Node.js official image as parent
FROM node:20

# Set working directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package*.json ./
RUN npm install --production

# Bundle all source code
COPY . .

# Expose the port (should match your server.js)
EXPOSE 8080

# Start the server
CMD [ "node", "server.js" ] 