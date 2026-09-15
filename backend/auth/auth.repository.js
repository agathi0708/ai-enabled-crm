const pool = require("../db");

/**
 * Find a user by email.
 */
async function findByEmail(email) {
  const result = await pool.query(
    `
      SELECT
        id,
        name,
        email,
        password_hash,
        role,
        is_active,
        created_at,
        updated_at
      FROM users
      WHERE LOWER(email) = LOWER($1)
      LIMIT 1
    `,
    [email]
  );

  return result.rows[0] || null;
}

/**
 * Find a user by UUID.
 */
async function findById(id) {
  const result = await pool.query(
    `
      SELECT
        id,
        name,
        email,
        password_hash,
        role,
        is_active,
        created_at,
        updated_at
      FROM users
      WHERE id = $1
      LIMIT 1
    `,
    [id]
  );

  return result.rows[0] || null;
}

/**
 * Create a new user.
 */
async function createUser({
  name,
  email,
  passwordHash,
  role = "rep",
}) {
  const result = await pool.query(
    `
      INSERT INTO users (
        name,
        email,
        password_hash,
        role,
        is_active
      )
      VALUES ($1, $2, $3, $4, TRUE)
      RETURNING
        id,
        name,
        email,
        role,
        is_active,
        created_at,
        updated_at
    `,
    [
      name,
      email,
      passwordHash,
      role,
    ]
  );

  return result.rows[0];
}

/**
 * Store a refresh token.
 */
async function createRefreshToken({
  token,
  userId,
  expiresAt,
}) {
  const result = await pool.query(
    `
      INSERT INTO refresh_tokens (
        token,
        user_id,
        is_revoked,
        expires_at
      )
      VALUES ($1, $2, FALSE, $3)
      RETURNING
        id,
        token,
        user_id,
        is_revoked,
        expires_at,
        created_at
    `,
    [
      token,
      userId,
      expiresAt,
    ]
  );

  return result.rows[0];
}

/**
 * Find a stored refresh token.
 */
async function findRefreshToken(token) {
  const result = await pool.query(
    `
      SELECT
        id,
        token,
        user_id,
        is_revoked,
        expires_at,
        created_at
      FROM refresh_tokens
      WHERE token = $1
      LIMIT 1
    `,
    [token]
  );

  return result.rows[0] || null;
}

/**
 * Revoke a refresh token.
 */
async function revokeRefreshToken(token) {
  const result = await pool.query(
    `
      UPDATE refresh_tokens
      SET is_revoked = TRUE
      WHERE token = $1
        AND is_revoked = FALSE
      RETURNING id
    `,
    [token]
  );

  return result.rowCount > 0;
}

/**
 * Create a password reset token.
 */
async function createPasswordResetToken({
  token,
  userId,
  expiresAt,
}) {
  const result = await pool.query(
    `
      INSERT INTO password_reset_tokens (
        token,
        user_id,
        is_used,
        expires_at
      )
      VALUES ($1, $2, FALSE, $3)
      RETURNING
        id,
        token,
        user_id,
        is_used,
        expires_at,
        created_at
    `,
    [
      token,
      userId,
      expiresAt,
    ]
  );

  return result.rows[0];
}

/**
 * Find a password reset token.
 */
async function findPasswordResetToken(token) {
  const result = await pool.query(
    `
      SELECT
        id,
        token,
        user_id,
        is_used,
        expires_at,
        created_at
      FROM password_reset_tokens
      WHERE token = $1
      LIMIT 1
    `,
    [token]
  );

  return result.rows[0] || null;
}

/**
 * Mark a password reset token as used.
 */
async function markPasswordResetTokenUsed(token) {
  const result = await pool.query(
    `
      UPDATE password_reset_tokens
      SET is_used = TRUE
      WHERE token = $1
        AND is_used = FALSE
    `,
    [token]
  );

  return result.rowCount > 0;
}

/**
 * Update a user's password.
 */
async function updatePassword(
  userId,
  passwordHash
) {
  const result = await pool.query(
    `
      UPDATE users
      SET
        password_hash = $1,
        updated_at = NOW()
      WHERE id = $2
      RETURNING
        id,
        name,
        email,
        role,
        is_active,
        created_at,
        updated_at
    `,
    [
      passwordHash,
      userId,
    ]
  );

  return result.rows[0] || null;
}

/**
 * Set a user's active state.
 */
async function setUserActive(
  userId,
  isActive
) {
  const result = await pool.query(
    `
      UPDATE users
      SET
        is_active = $1,
        updated_at = NOW()
      WHERE id = $2
      RETURNING
        id,
        name,
        email,
        role,
        is_active,
        created_at,
        updated_at
    `,
    [
      isActive,
      userId,
    ]
  );

  return result.rows[0] || null;
}

module.exports = {
  findByEmail,
  findById,
  createUser,
  createRefreshToken,
  findRefreshToken,
  revokeRefreshToken,
  createPasswordResetToken,
  findPasswordResetToken,
  markPasswordResetTokenUsed,
  updatePassword,
  setUserActive,
};
