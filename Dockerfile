# Multi-stage Dockerfile for LazyDesk AI on Render
FROM node:20-slim AS frontend-builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Python runtime stage
FROM python:3.11-slim
WORKDIR /app

ENV PYTHONUNBUFFERED=1 \
    HOSTED_DEMO=true \
    PORT=8000

# Install system dependencies for PyMuPDF
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code and built frontend
COPY . .
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

# Initialize sample workspace for hosted exploration
RUN python -c "from pathlib import Path; from backend.demo_workspace import setup_demo_workspace; setup_demo_workspace(Path('sample_workspace'))"

EXPOSE 8000

CMD ["sh", "-c", "uvicorn backend.main:app --host 0.0.0.0 --port ${PORT}"]
