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
        role
      )
      VALUES ($1, $2, $3, $4)
      RETURNING
        id,
        name,
        email,
        role,
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

module.exports = {
  findByEmail,
  findById,
  createUser,
};