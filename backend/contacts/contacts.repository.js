const pool = require("../db");

/**
 * Get contacts with optional filters and pagination.
 */
async function findAll({
  page = 1,
  limit = 20,
  status,
  tag,
  search,
  ownerId,
}) {
  const offset = (page - 1) * limit;

  const conditions = [];
  const values = [];
  let parameterIndex = 1;

  if (status) {
    conditions.push(`status = $${parameterIndex++}`);
    values.push(status);
  }

  if (tag) {
    conditions.push(`$${parameterIndex++} = ANY(tags)`);
    values.push(tag);
  }

  if (search) {
    conditions.push(
      `(name ILIKE $${parameterIndex} OR company ILIKE $${parameterIndex})`
    );
    values.push(`%${search}%`);
    parameterIndex++;
  }

  if (ownerId) {
    conditions.push(`owner_id = $${parameterIndex++}`);
    values.push(ownerId);
  }

  const whereClause =
    conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  const countQuery = `
    SELECT COUNT(*)::int AS total
    FROM contacts
    ${whereClause}
  `;

  const dataQuery = `
    SELECT
      id,
      owner_id,
      name,
      company,
      email,
      phone,
      status,
      tags,
      source,
      notes,
      created_at,
      updated_at
    FROM contacts
    ${whereClause}
    ORDER BY created_at DESC
    LIMIT $${parameterIndex}
    OFFSET $${parameterIndex + 1}
  `;

  const countResult = await pool.query(countQuery, values);

  const dataValues = [...values, limit, offset];
  const dataResult = await pool.query(dataQuery, dataValues);

  return {
    contacts: dataResult.rows,
    total: countResult.rows[0].total,
  };
}

/**
 * Find one contact by ID.
 */
async function findById(id) {
  const result = await pool.query(
    `
      SELECT
        id,
        owner_id,
        name,
        company,
        email,
        phone,
        status,
        tags,
        source,
        notes,
        created_at,
        updated_at
      FROM contacts
      WHERE id = $1
    `,
    [id]
  );

  return result.rows[0] || null;
}

/**
 * Create a contact.
 */
async function create({
  ownerId,
  name,
  company,
  email,
  phone,
  status = "new",
  tags = [],
  source,
  notes,
}) {
  const result = await pool.query(
    `
      INSERT INTO contacts (
        owner_id,
        name,
        company,
        email,
        phone,
        status,
        tags,
        source,
        notes
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING
        id,
        owner_id,
        name,
        company,
        email,
        phone,
        status,
        tags,
        source,
        notes,
        created_at,
        updated_at
    `,
    [
      ownerId,
      name,
      company || null,
      email || null,
      phone || null,
      status,
      tags,
      source || null,
      notes || null,
    ]
  );

  return result.rows[0];
}

/**
 * Update a contact.
 */
async function update(id, fields) {
  const allowedFields = [
    "name",
    "company",
    "email",
    "phone",
    "status",
    "tags",
    "source",
    "notes",
  ];

  const setParts = [];
  const values = [];
  let parameterIndex = 1;

  for (const field of allowedFields) {
    if (Object.prototype.hasOwnProperty.call(fields, field)) {
      setParts.push(`${field} = $${parameterIndex++}`);
      values.push(fields[field]);
    }
  }

  if (setParts.length === 0) {
    return findById(id);
  }

  setParts.push("updated_at = NOW()");
  values.push(id);

  const result = await pool.query(
    `
      UPDATE contacts
      SET ${setParts.join(", ")}
      WHERE id = $${parameterIndex}
      RETURNING
        id,
        owner_id,
        name,
        company,
        email,
        phone,
        status,
        tags,
        source,
        notes,
        created_at,
        updated_at
    `,
    values
  );

  return result.rows[0] || null;
}

/**
 * Delete a contact.
 */
async function remove(id) {
  const result = await pool.query(
    `
      DELETE FROM contacts
      WHERE id = $1
      RETURNING id
    `,
    [id]
  );

  return result.rows[0] || null;
}

module.exports = {
  findAll,
  findById,
  create,
  update,
  remove,
};