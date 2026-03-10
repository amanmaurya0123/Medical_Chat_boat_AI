# Use Python 3.12 so all packages get pre-built wheels (no Rust/pydantic-core source build)
FROM python:3.12-slim

WORKDIR /app

# Install dependencies first (better layer caching)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Render sets PORT at runtime
ENV PORT=8000
EXPOSE $PORT

CMD uvicorn api:app --host 0.0.0.0 --port ${PORT}
