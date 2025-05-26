# Use a recent Node.js LTS version on Alpine Linux for a smaller image size
FROM node:20-alpine

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json (or yarn.lock)
# This step is cached by Docker if these files don't change, speeding up subsequent builds
COPY package*.json ./

# Install application dependencies
# Using "npm ci" is recommended for reproducible builds if you have a package-lock.json
# --only=production ensures only production dependencies are installed, reducing image size.
# If your "start:prod" script requires devDependencies, you might need to adjust this.
RUN npm ci --only=production
# If you don't use package-lock.json, you can use:
# RUN npm install --only=production

# Bundle the rest of your application's source code into the image
#COPY . .

# Expose the port your application runs on (matching the 'ports' in docker-compose.yml)
EXPOSE 3000

# Default command to run the application.
# Note: This will be overridden by the 'command: npm run start:prod' in your docker-compose.yml
CMD [ "node", "your-main-app-file.js" ] # Replace "your-main-app-file.js" with your app's entry point