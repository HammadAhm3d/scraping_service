# Base image for Node.js application
FROM node:16-alpine

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json (or yarn.lock)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy remaining application code
COPY . .

# Expose port for the scraping service
EXPOSE 5001

# Start the application
CMD [ "npm", "run", "dev" ] 

# Reference environment variables from .env file
ENV $(cat .env)  
