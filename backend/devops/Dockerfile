# Use Node.js LTS image
FROM node:22

# Create app directory
WORKDIR /app

# Copy files
COPY ../app .

# Install dependencies
RUN npm install pg

# Expose the server port
EXPOSE 3500

# Start the backend
CMD ["node", "server.js"]
