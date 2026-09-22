const pool = require("../db");

/**
 * Get a contact owned by the authenticated user.
 */
async function getContactById(
  contactId,
  ownerId
) {
  const result = await pool.query(
    `
      SELECT
        c.id,
        c.name,
        c.company,
        c.email,
        c.phone,
        c.status,
        c.tags,
        c.source,
        c.notes,
        c.created_at,
        c.updated_at
      FROM contacts c
      WHERE c.id = $1
        AND c.owner_id = $2
      LIMIT 1
    `,
    [contactId, ownerId]
  );

  return result.rows[0] || null;
}

/**
 * Get recent activities for a contact.
 */
async function getActivitiesByContactId(
  contactId,
  ownerId
) {
  const result = await pool.query(
    `
      SELECT
        a.id,
        a.type,
        a.notes,
        a.created_at
      FROM activities a
      INNER JOIN contacts c
        ON c.id = a.contact_id
      WHERE a.contact_id = $1
        AND c.owner_id = $2
      ORDER BY a.created_at DESC
      LIMIT 20
    `,
    [contactId, ownerId]
  );

  return result.rows;
}

/**
 * Get deals associated with a contact.
 */
async function getDealsByContactId(
  contactId,
  ownerId
) {
  const result = await pool.query(
    `
      SELECT
        d.id,
        d.name,
        d.stage,
        d.amount,
        d.created_at,
        d.updated_at
      FROM deals d
      WHERE d.contact_id = $1
        AND d.owner_id = $2
      ORDER BY d.created_at DESC
    `,
    [contactId, ownerId]
  );

  return result.rows;
}

/**
 * Get tasks associated with a contact.
 */
async function getTasksByContactId(
  contactId,
  ownerId
) {
  const result = await pool.query(
    `
      SELECT
        t.id,
        t.title,
        t.description,
        t.priority,
        t.status,
        t.due_date,
        t.created_at,
        t.updated_at
      FROM tasks t
      WHERE t.contact_id = $1
        AND t.owner_id = $2
      ORDER BY t.due_date ASC NULLS LAST
      LIMIT 20
    `,
    [contactId, ownerId]
  );

  return result.rows;
}

module.exports = {
  getContactById,
  getActivitiesByContactId,
  getDealsByContactId,
  getTasksByContactId,
};