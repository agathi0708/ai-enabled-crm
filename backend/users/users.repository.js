const pool = require("../db");

/**
 * Get all users.
 */
async function findAll() {
  const result = await pool.query(`
    SELECT
      id,
      name,
      email,
      role,
      is_active,
      created_at,
      updated_at
    FROM users
    ORDER BY created_at DESC
  `);

  return result.rows;
}

/**
 * Find a user by ID.
 */
async function findById(id) {
  const result = await pool.query(
    `
      SELECT
        id,
        name,
        email,
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
async function create({
  name,
  email,
  passwordHash,
  role,
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
      VALUES (
        $1,
        $2,
        $3,
        $4,
        TRUE
      )
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
 * Activate or deactivate a user.
 */
async function setActive(
  id,
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
      id,
    ]
  );

  return result.rows[0] || null;
}

module.exports = {
  findAll,
  findById,
  create,
  setActive,
};