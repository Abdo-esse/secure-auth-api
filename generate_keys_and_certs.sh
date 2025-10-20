#!/bin/bash
set -e

mkdir -p secrets certs

echo "🔑 Generating RSA key pair for JWT..."
openssl genrsa -out secrets/jwt_private.pem 2048
openssl rsa -in secrets/jwt_private.pem -pubout -out secrets/jwt_public.pem

echo "🔒 Generating self-signed HTTPS certificate..."

# Créer le certificat sans sujet interactif
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout certs/localhost.key \
  -out certs/localhost.crt \
  -subj "//C=MA\ST=Rabat\L=Rabat\O=Youcode\OU=Dev\CN=localhost" \
  -sha256

echo "✅ Keys and certificates generated successfully!"