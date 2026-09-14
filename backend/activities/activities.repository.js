const pool = require("../db");

/**
 * Create an activity for a contact.
 */
async function create({
  contactId,
  type,
  notes,
}) {
  const result = await pool.query(
    `
      INSERT INTO activities (
        contact_id,
        type,
        notes
      )
      VALUES ($1, $2, $3)
      RETURNING
        id,
        contact_id,
        type,
        notes,
        created_at
    `,
    [contactId, type, notes]
  );

  return result.rows[0];
}

/**
 * Check whether a contact exists.
 */
async function contactExists(contactId) {
  const result = await pool.query(
    `
      SELECT id
      FROM contacts
      WHERE id = $1
    `,
    [contactId]
  );

  return Boolean(result.rows[0]);
}

/**
 * Get activities for a contact with pagination.
 */
async function findByContactId({
  contactId,
  page = 1,
  limit = 20,
}) {
  const offset = (page - 1) * limit;

  const countResult = await pool.query(
    `
      SELECT COUNT(*)::int AS total
      FROM activities
      WHERE contact_id = $1
    `,
    [contactId]
  );

  const dataResult = await pool.query(
    `
      SELECT
        id,
        contact_id,
        type,
        notes,
        created_at
      FROM activities
      WHERE contact_id = $1
      ORDER BY created_at DESC
      LIMIT $2
      OFFSET $3
    `,
    [contactId, limit, offset]
  );

  return {
    activities: dataResult.rows,
    total: countResult.rows[0].total,
  };
}

/**
 * Get a summary of activity counts for a contact.
 */
async function getSummary(contactId) {
  const result = await pool.query(
    `
      SELECT
        COUNT(*)::int AS total,
        COUNT(*) FILTER (
          WHERE type = 'call'
        )::int AS calls,
        COUNT(*) FILTER (
          WHERE type = 'email'
        )::int AS emails,
        COUNT(*) FILTER (
          WHERE type = 'meeting'
        )::int AS meetings,
        COUNT(*) FILTER (
          WHERE type = 'note'
        )::int AS notes,
        MAX(created_at) AS last_activity_at
      FROM activities
      WHERE contact_id = $1
    `,
    [contactId]
  );

  return result.rows[0];
}

/**
 * Delete an activity by ID.
 *
 * Returns the deleted activity when found,
 * otherwise returns null.
 */
async function remove(id) {
  const result = await pool.query(
    `
      DELETE FROM activities
      WHERE id = $1
      RETURNING
        id,
        contact_id,
        type,
        notes,
        created_at
    `,
    [id]
  );

  return result.rows[0] || null;
}

module.exports = {
  create,
  contactExists,
  findByContactId,
  getSummary,
  remove,
};