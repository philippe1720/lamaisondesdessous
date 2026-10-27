FROM python:3.12-slim
ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1 OTEL_SDK_DISABLED=true
WORKDIR /app
RUN useradd --create-home --shell /usr/sbin/nologin app
COPY requirements.lock .
RUN pip install --no-cache-dir -r requirements.lock
COPY --chown=app:app app ./app
USER app
CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-10000} --workers 1 --no-access-log"]
