require("dotenv").config();

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET;

const JWT_EXPIRES_IN =
  process.env.JWT_EXPIRES_IN || "15m";

const JWT_REFRESH_EXPIRES_IN =
  process.env.JWT_REFRESH_EXPIRES_IN || "7d";

if (!JWT_SECRET) {
  throw new Error(
    "JWT_SECRET is required in backend/.env"
  );
}

/**
 * Hash a plain-text password.
 */
async function hashPassword(password) {
  return bcrypt.hash(password, 12);
}

/**
 * Compare a plain-text password
 * with a stored password hash.
 */
async function verifyPassword(
  password,
  passwordHash
) {
  return bcrypt.compare(
    password,
    passwordHash
  );
}

/**
 * Create an access token.
 *
 * `sub` contains the UUID of the
 * authenticated user.
 */
function createAccessToken(user) {
  return jwt.sign(
    {
      sub: String(user.id),
      email: user.email,
      role: user.role,
      type: "access",
    },
    JWT_SECRET,
    {
      expiresIn: JWT_EXPIRES_IN,
      algorithm: "HS256",
    }
  );
}

/**
 * Create a refresh token.
 */
function createRefreshToken(user) {
  return jwt.sign(
    {
      sub: String(user.id),
      email: user.email,
      role: user.role,
      type: "refresh",
    },
    JWT_SECRET,
    {
      expiresIn: JWT_REFRESH_EXPIRES_IN,
      algorithm: "HS256",
    }
  );
}

/**
 * Verify an access token.
 */
function verifyAccessToken(token) {
  const payload = jwt.verify(
    token,
    JWT_SECRET,
    {
      algorithms: ["HS256"],
    }
  );

  if (payload.type !== "access") {
    throw new Error(
      "Invalid access token"
    );
  }

  return payload;
}

/**
 * Verify a refresh token.
 */
function verifyRefreshToken(token) {
  const payload = jwt.verify(
    token,
    JWT_SECRET,
    {
      algorithms: ["HS256"],
    }
  );

  if (payload.type !== "refresh") {
    throw new Error(
      "Invalid refresh token"
    );
  }

  return payload;
}

module.exports = {
  hashPassword,
  verifyPassword,
  createAccessToken,
  createRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
};