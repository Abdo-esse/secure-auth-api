const rateLimit = require("express-rate-limit");

exports.loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // max tentatives
  message: "Trop de tentatives de connexion, réessayez plus tard.",
  standardHeaders: true,
  legacyHeaders: false,
});
