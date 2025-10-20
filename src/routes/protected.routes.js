const router = require("express").Router();
const { verifyAccessToken } = require("../services/jwt.service");

router.get("/", (req, res) => {
  res.json({ message: "Protected route OK" });
});

module.exports = router;
