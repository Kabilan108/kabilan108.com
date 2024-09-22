FROM oven/bun:1.1.27-slim AS builder

# Set the working directory in the container
WORKDIR /app

# Copy package.json and bun.lockb (if it exists)
COPY package.json bun.lockb* ./

# Install dependencies
RUN bun install

# Copy the rest of the application code
COPY . .

# Build the application
RUN bun run build

# Use a lightweight web server to serve the built application
FROM nginx:alpine

# Copy the built files from the builder stage to the nginx server
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Start Nginx server
CMD ["nginx", "-g", "daemon off;"]
