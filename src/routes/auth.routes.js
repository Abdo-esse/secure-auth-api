const router = require("express").Router();
const { register, login, refreshToken, logout } = require("../controllers/auth.controller");
const { loginLimiter } = require("../middleware/rateLimiter");
const  authMiddleware = require("../middleware/authMiddleware");
router.post("/register", register);
router.post("/login", loginLimiter, login);
router.post("/refresh", refreshToken);
router.post("/logout", authMiddleware, logout);

// nouvelle route protégée
router.get("/profile", authMiddleware, (req, res) => {
  res.json({
    message: "User profile info",
    user: req.user, // ici tu renvoies les infos du token
  });
});

module.exports = router;
