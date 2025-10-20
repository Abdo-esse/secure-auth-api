const fs = require("fs");
const path = require("path");
const morgan = require("morgan");

// 📁 Création automatique du dossier logs s’il n’existe pas
const logDir = path.join(__dirname, "../logs");
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// 🧾 Fichier de log
const accessLogPath = path.join(logDir, "access.log");
const logStream = fs.createWriteStream(accessLogPath, { flags: "a" });

// 🔹 Middleware pour logger les requêtes HTTP
exports.httpLogger = morgan("combined", { stream: logStream });

// 🔹 Fonctions utilitaires de log
exports.info = (msg) => console.log(`[INFO] ${new Date().toISOString()} - ${msg}`);
exports.warn = (msg) => console.warn(`[WARN] ${new Date().toISOString()} - ${msg}`);
exports.error = (msg, err) =>
  console.error(`[ERROR] ${new Date().toISOString()} - ${msg}`, err || "");
