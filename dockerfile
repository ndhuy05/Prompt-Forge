# Ultra-lightweight Docker build for production (text-based similarity only)
FROM node:18-slim as base

# Install minimal system dependencies only
RUN apt-get update && apt-get install -y \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Set Node environment variables for production
ENV NODE_ENV=production
ENV GEMINI_API_KEY=AIzaSyCbCVIwSZQaa5jMeFNL0wkepxkDR_o6AtE

WORKDIR /app

# Copy dependency files first for better Docker layer caching
COPY server/package*.json ./

# Install Node.js dependencies only
RUN npm ci --only=production && npm cache clean --force

# Copy application source code
COPY server/ ./

# Create directories for static files
RUN mkdir -p public/images

# Create non-root user for security
RUN groupadd -r nodeuser && useradd -r -g nodeuser -m -u 1001 nodeuser && \
    chown -R nodeuser:nodeuser /app
USER nodeuser

# Expose port
EXPOSE 5000

# Add health check
HEALTHCHECK --interval=30s --timeout=15s --start-period=30s --retries=3 \
    CMD curl -f http://localhost:5000/health || exit 1

# Start the application
CMD ["npm", "start"]