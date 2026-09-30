#!/bin/sh
# Creates the local MinIO bucket and service account on first start.
# Runs once via the minio-init container in docker-compose.yml.
set -e

MINIO_ENDPOINT="http://minio:9000"

echo "Waiting for MinIO to be ready..."
until mc alias set local "$MINIO_ENDPOINT" "$MINIO_ROOT_USER" "$MINIO_ROOT_PASSWORD" 2>/dev/null; do
  sleep 2
done

echo "MinIO ready. Configuring bucket and credentials..."

# Create the media bucket if it does not already exist
if mc ls "local/$MINIO_BUCKET" > /dev/null 2>&1; then
  echo "Bucket '$MINIO_BUCKET' already exists — skipping creation."
else
  mc mb "local/$MINIO_BUCKET"
  echo "Bucket '$MINIO_BUCKET' created."
fi

# Set bucket policy to allow public read for media files served through the web proxy
mc anonymous set download "local/$MINIO_BUCKET"

# Create a service account (access key) for Strapi to use
mc admin user svcacct add \
  --access-key "$MINIO_ACCESS_KEY" \
  --secret-key "$MINIO_SECRET_KEY" \
  local "$MINIO_ROOT_USER" > /dev/null 2>&1 || echo "Service account already exists — skipping."

echo "MinIO init complete."
echo "  Bucket:     $MINIO_BUCKET"
echo "  Access key: $MINIO_ACCESS_KEY"
echo "  Console:    http://localhost:9001"
