// Central config. Values can be overridden with environment variables.
module.exports = {
  PORT: process.env.PORT || 8082,
  MONGO_URI: process.env.MONGO_URI || 'mongodb://localhost:27017/onboarding_db',
  // Same secret Spring Boot signs its JWTs with — lets Node verify the same tokens.
  JWT_SECRET: process.env.JWT_SECRET || 'onboarding_secret_key_must_be_32chars!!',
  // Shared key for server-to-server calls (Spring Boot -> Node activity logging).
  INTERNAL_KEY: process.env.INTERNAL_KEY || 'onboarding-internal-key',
};
