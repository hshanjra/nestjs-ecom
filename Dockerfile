# Use an official Node.js runtime as a parent image
FROM node:21

# Set the working directory
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Set environment variables
ENV NIXPACKS_PATH=/app/node_modules/.bin:$NIXPACKS_PATH

# Copy the rest of the application code
COPY . /app/.

# Run npm ci with cache mount and verbose output
RUN --mount=type=cache,id=s/b5a1c4fc-b0fb-4984-9d70-4bde14acfc60-/root/npm,target=/root/.npm npm ci --verbose

# Build the application
RUN npm run build

# Expose the port the app runs on
EXPOSE 3000

# Define the command to run the application
CMD ["npm", "start"]
