#!/bin/bash
set -e

mkdir -p secrets certs

echo "Generating RSA key pair for JWT..."
openssl genrsa -out secrets/jwt_private.pem 2048
openssl rsa -in secrets/jwt_private.pem -pubout -out secrets/jwt_public.pem

echo "Generating self-signed HTTPS certificate..."
openssl req -x509 -newkey rsa:2048 -keyout certs/localhost.key -out certs/localhost.crt -days 365 -nodes -subj "/CN=localhost"

echo "✅ Keys and certificates generated successfully!"
