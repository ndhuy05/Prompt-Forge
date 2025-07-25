# Multi-stage Docker build for optimal size and security
FROM node:18-slim as base

# Install system dependencies
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    python3-dev \
    python3-venv \
    build-essential \
    curl \
    wget \
    && ln -s /usr/bin/python3 /usr/bin/python \
    && rm -rf /var/lib/apt/lists/*

# Set Python environment variables
ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1
ENV PIP_NO_CACHE_DIR=1
ENV PIP_DISABLE_PIP_VERSION_CHECK=1

WORKDIR /app

# Create Python virtual environment
RUN python3 -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Copy dependency files first for better Docker layer caching
COPY server/package*.json ./
COPY server/requirements.txt ./

# Install Node.js dependencies
RUN npm ci --only=production && npm cache clean --force

# Install Python dependencies with optimizations
RUN pip install --upgrade pip && \
    pip install --no-cache-dir \
    --index-url https://download.pytorch.org/whl/cpu \
    torch>=2.5.0 && \
    pip install --no-cache-dir -r requirements.txt

# Copy application source code
COPY server/ ./

# Create directories for static files and ensure proper permissions
RUN mkdir -p public/images && \
    chmod 755 public

# Create non-root user for security
RUN groupadd -r nodeuser && useradd -r -g nodeuser -m -u 1001 nodeuser && \
    chown -R nodeuser:nodeuser /app /opt/venv
USER nodeuser

# Expose port
EXPOSE 5000

# Add health check
HEALTHCHECK --interval=30s --timeout=15s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:5000/health || exit 1

# Start the application
CMD ["npm", "start"]