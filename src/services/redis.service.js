const { createClient } = require("redis");
const client = createClient({ url: `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}` });
client.connect();

exports.revokeToken = async (jti, exp) => {
  const ttl = exp - Math.floor(Date.now() / 1000);
  await client.set(`revoked:${jti}`, "true", { EX: ttl });
};

exports.isRevoked = async (jti) => {
  return await client.exists(`revoked:${jti}`);
};
