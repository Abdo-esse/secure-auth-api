# Dockerfile pour MoneyWise
FROM node:20-alpine

# Créer le répertoire de travail
WORKDIR /usr/src/app

# Copier package.json et package-lock.json
COPY package*.json ./

# Installer les dépendances
RUN npm install

# Copier tout le projet
COPY . .

# Exposer le port
EXPOSE 3000

# Commande par défaut
CMD ["npm", "run", "dev"]
