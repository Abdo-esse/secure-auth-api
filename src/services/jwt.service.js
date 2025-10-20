const fs = require("fs");
const jwt = require("jsonwebtoken");

const privateKey = fs.readFileSync(process.env.JWT_PRIVATE_KEY_PATH);
const publicKey = fs.readFileSync(process.env.JWT_PUBLIC_KEY_PATH);

exports.generateAccessToken = (user) => {
  return jwt.sign(
    { sub: user._id, email: user.email },
    privateKey,
    { algorithm: process.env.JWT_ALGO, expiresIn: process.env.ACCESS_TOKEN_EXPIRES }
  );
};

exports.verifyAccessToken = (token) => {
  return jwt.verify(token, publicKey, { algorithms: [process.env.JWT_ALGO] });
};
