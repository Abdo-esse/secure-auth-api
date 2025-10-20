const jwt = require("jsonwebtoken");
const User = require("../models/User");
const RefreshToken = require("../models/RefreshToken");
const { generateAccessToken, verifyAccessToken } = require("../services/jwt.service");
const { revokeToken } = require("../services/redis.service");
const logger = require("../services/logger.service");
const bcrypt = require("bcrypt");
const fs = require("fs");
const path = require("path");

const privateKey = fs.readFileSync(process.env.JWT_PRIVATE_KEY_PATH);

exports.register = async (req, res) => {
  try {
    const { email, password } = req.body;

    const existing = await User.findOne({ email });
    if (existing) {
      logger.warn(`Tentative d'inscription avec email existant: ${email}`);
      return res.status(400).json({ message: "Email déjà utilisé." });
    }

    await User.create({ email, password });
    logger.info(`Nouvel utilisateur enregistré: ${email}`);
    res.status(201).json({ message: "Inscription réussie." });
  } catch (err) {
    logger.error("Erreur inscription:", err);
    res.status(500).json({ error: "Erreur interne du serveur" });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      logger.warn(`Login échoué pour ${email}`);
      return res.status(401).json({ message: "Identifiants invalides" });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      logger.warn(`Mot de passe incorrect pour ${email}`);
      return res.status(401).json({ message: "Identifiants invalides" });
    }

    // Générer un access token court
    const accessToken = generateAccessToken(user);

    // Générer un refresh token (7 jours)
    const refreshToken = jwt.sign(
      { sub: user._id, type: "refresh" },
      privateKey,
      { algorithm: process.env.JWT_ALGO, expiresIn: process.env.REFRESH_TOKEN_EXPIRES }
    );

    // Sauvegarde du refresh token en base
    await RefreshToken.create({
      userId: user._id,
      token: refreshToken,
      expiresAt: new Date(Date.now() + 7 * 86400000)
    });

    // Stockage sécurisé dans un cookie HTTP-only
    res.cookie("refresh_token", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "Strict",
      maxAge: 7 * 86400000,
    });

    logger.info(`Connexion réussie pour ${email}`);
    res.json({ accessToken });
  } catch (err) {
    logger.error("Erreur login:", err);
    res.status(500).json({ error: "Erreur interne du serveur" });
  }
};

exports.refreshToken = async (req, res) => {
  try {
    const refreshToken = req.cookies.refresh_token;
    if (!refreshToken) return res.status(401).json({ message: "Aucun refresh token" });

    const stored = await RefreshToken.findOne({ token: refreshToken });
    if (!stored) return res.status(403).json({ message: "Refresh token invalide" });

    const publicKey = fs.readFileSync(process.env.JWT_PUBLIC_KEY_PATH);
    const decoded = jwt.verify(refreshToken, publicKey, { algorithms: [process.env.JWT_ALGO] });

    const user = await User.findById(decoded.sub);
    if (!user) return res.status(404).json({ message: "Utilisateur introuvable" });

    const newAccessToken = generateAccessToken(user);
    logger.info(`Refresh token utilisé pour ${user.email}`);
    res.json({ accessToken: newAccessToken });
  } catch (err) {
    logger.warn("Tentative de refresh token invalide", err.message);
    res.status(403).json({ message: "Refresh token invalide" });
  }
};

exports.logout = async (req, res) => {
  try {
    const refreshToken = req.cookies.refresh_token;
    if (refreshToken) {
      await RefreshToken.deleteOne({ token: refreshToken });
      res.clearCookie("refresh_token");
      logger.info("Utilisateur déconnecté avec succès");
    }
    res.json({ message: "Déconnecté avec succès" });
  } catch (err) {
    logger.error("Erreur logout:", err);
    res.status(500).json({ error: "Erreur interne du serveur" });
  }
};
