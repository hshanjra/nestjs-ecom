# Use an official Node.js runtime as a parent image
FROM node:18-alpine

# Set the working directory
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN node --max-old-space-size=4096 /usr/local/bin/npm install

# Set environment variables with the correct format
ENV NIXPACKS_PATH=/app/node_modules/.bin:$NIXPACKS_PATH

# Copy the rest of the application code
COPY . /app/.

# Run npm ci with increased memory limit and cache mount with a key prefix
RUN --mount=type=cache,id=s/b5a1c4fc-b0fb-4984-9d70-4bde14acfc60-/root/npm,target=/root/.npm node --max-old-space-size=4096 /usr/local/bin/npm ci --verbose

# Build the application with increased memory limit
RUN node --max-old-space-size=4096 /usr/local/bin/npm run build

# Expose the port the app runs on
EXPOSE 3000

# Define the command to run the application
CMD ["node", "--max-old-space-size=4096", "/usr/local/bin/npm", "start"]
