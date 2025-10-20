const fs = require("fs");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid"); // npm install uuid

const privateKey = fs.readFileSync(process.env.JWT_PRIVATE_KEY_PATH);
const publicKey = fs.readFileSync(process.env.JWT_PUBLIC_KEY_PATH);

exports.generateAccessToken = (user) => {
  const jti = uuidv4(); // Génère un identifiant unique
  const payload = {
    sub: user._id,
    email: user.email,
    jti, // Ajout du jti
  };

  const token = jwt.sign(payload, privateKey, {
    algorithm: process.env.JWT_ALGO,
    expiresIn: process.env.ACCESS_TOKEN_EXPIRES,
  });

  return token;
};

exports.verifyAccessToken = (token) => {
  return jwt.verify(token, publicKey, { algorithms: [process.env.JWT_ALGO] });
};




