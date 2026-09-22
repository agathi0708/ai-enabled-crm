const pool = require("../db");

/**
 * Find all deals belonging to the authenticated owner.
 */
async function findAll({
  page = 1,
  limit = 20,
  stage,
  search,
  ownerId,
}) {
  const offset = (page - 1) * limit;

  const conditions = [];
  const values = [];
  let parameterIndex = 1;

  conditions.push(
    `d.owner_id = $${parameterIndex++}`
  );

  values.push(ownerId);

  if (stage) {
    conditions.push(
      `d.stage = $${parameterIndex++}`
    );

    values.push(stage);
  }

  if (search) {
    conditions.push(
      `(d.name ILIKE $${parameterIndex}
        OR c.name ILIKE $${parameterIndex}
        OR c.company ILIKE $${parameterIndex})`
    );

    values.push(`%${search}%`);
    parameterIndex++;
  }

  const whereClause =
    `WHERE ${conditions.join(" AND ")}`;

  const countQuery = `
    SELECT COUNT(*)::int AS total
    FROM deals d
    INNER JOIN contacts c
      ON c.id = d.contact_id
    ${whereClause}
  `;

  const dataQuery = `
    SELECT
      d.id,
      d.owner_id,
      d.contact_id,
      d.name,
      d.stage,
      d.amount,
      d.created_at,
      d.updated_at,

      c.name AS contact_name,
      c.company AS contact_company,
      c.email AS contact_email,
      c.phone AS contact_phone,
      c.status AS contact_status

    FROM deals d

    INNER JOIN contacts c
      ON c.id = d.contact_id

    ${whereClause}

    ORDER BY d.created_at DESC

    LIMIT $${parameterIndex}
    OFFSET $${parameterIndex + 1}
  `;

  const countResult = await pool.query(
    countQuery,
    values
  );

  const dataResult = await pool.query(
    dataQuery,
    [
      ...values,
      limit,
      offset,
    ]
  );

  return {
    deals: dataResult.rows,
    total: countResult.rows[0].total,
  };
}

/**
 * Create a new deal for a contact owned by
 * the authenticated user.
 */
async function createDeal({
  ownerId,
  contactId,
  name,
  amount,
  stage,
}) {
  const contactResult = await pool.query(
    `
      SELECT id
      FROM contacts
      WHERE id = $1
        AND owner_id = $2
      LIMIT 1
    `,
    [
      contactId,
      ownerId,
    ]
  );

  if (!contactResult.rows[0]) {
    return null;
  }

  const result = await pool.query(
    `
      INSERT INTO deals (
        owner_id,
        contact_id,
        name,
        stage,
        amount
      )
      VALUES (
        $1,
        $2,
        $3,
        $4,
        $5
      )
      RETURNING
        id,
        owner_id,
        contact_id,
        name,
        stage,
        amount,
        created_at,
        updated_at
    `,
    [
      ownerId,
      contactId,
      name,
      stage,
      amount,
    ]
  );

  return result.rows[0] || null;
}

/**
 * Update deal details.
 *
 * The owner_id condition prevents one user
 * from modifying another user's deal.
 */
async function updateDeal({
  dealId,
  ownerId,
  name,
  amount,
  stage,
}) {
  const fields = [];
  const values = [];
  let parameterIndex = 1;

  if (name !== undefined) {
    fields.push(
      `name = $${parameterIndex++}`
    );

    values.push(name);
  }

  if (amount !== undefined) {
    fields.push(
      `amount = $${parameterIndex++}`
    );

    values.push(amount);
  }

  if (stage !== undefined) {
    fields.push(
      `stage = $${parameterIndex++}`
    );

    values.push(stage);
  }

  if (fields.length === 0) {
    const result = await pool.query(
      `
        SELECT
          id,
          owner_id,
          contact_id,
          name,
          stage,
          amount,
          created_at,
          updated_at
        FROM deals
        WHERE id = $1
          AND owner_id = $2
        LIMIT 1
      `,
      [
        dealId,
        ownerId,
      ]
    );

    return result.rows[0] || null;
  }

  fields.push(
    "updated_at = NOW()"
  );

  values.push(
    dealId,
    ownerId
  );

  const result = await pool.query(
    `
      UPDATE deals
      SET
        ${fields.join(", ")}
      WHERE id = $${parameterIndex}
        AND owner_id = $${parameterIndex + 1}
      RETURNING
        id,
        owner_id,
        contact_id,
        name,
        stage,
        amount,
        created_at,
        updated_at
    `,
    values
  );

  return result.rows[0] || null;
}

/**
 * Delete a deal.
 *
 * The owner_id condition prevents one user
 * from deleting another user's deal.
 */
async function deleteDeal({
  dealId,
  ownerId,
}) {
  const result = await pool.query(
    `
      DELETE FROM deals
      WHERE id = $1
        AND owner_id = $2
      RETURNING
        id,
        owner_id,
        contact_id,
        name,
        stage,
        amount,
        created_at,
        updated_at
    `,
    [
      dealId,
      ownerId,
    ]
  );

  return result.rows[0] || null;
}

/**
 * Update a deal stage.
 *
 * The owner_id condition prevents one user
 * from modifying another user's deal.
 */
async function updateStage({
  dealId,
  stage,
  ownerId,
}) {
  const result = await pool.query(
    `
      UPDATE deals
      SET
        stage = $1,
        updated_at = NOW()
      WHERE id = $2
        AND owner_id = $3
      RETURNING
        id,
        owner_id,
        contact_id,
        name,
        stage,
        amount,
        created_at,
        updated_at
    `,
    [
      stage,
      dealId,
      ownerId,
    ]
  );

  return result.rows[0] || null;
}

/**
 * Find an existing deal for a contact owned by
 * the authenticated user.
 */
async function findByContact(
  client,
  ownerId,
  contactId
) {
  const result = await client.query(
    `
      SELECT
        id,
        owner_id,
        contact_id,
        name,
        stage,
        amount,
        created_at,
        updated_at
      FROM deals
      WHERE owner_id = $1
        AND contact_id = $2
      LIMIT 1
    `,
    [
      ownerId,
      contactId,
    ]
  );

  return result.rows[0] || null;
}

/**
 * Create a deal from a contact.
 */
async function createFromContact(
  client,
  {
    ownerId,
    contactId,
    name,
  }
) {
  const result = await client.query(
    `
      INSERT INTO deals (
        owner_id,
        contact_id,
        name,
        stage
      )
      VALUES (
        $1,
        $2,
        $3,
        'new'
      )
      RETURNING
        id,
        owner_id,
        contact_id,
        name,
        stage,
        amount,
        created_at,
        updated_at
    `,
    [
      ownerId,
      contactId,
      name,
    ]
  );

  return result.rows[0];
}

module.exports = {
  findAll,
  createDeal,
  updateDeal,
  deleteDeal,
  updateStage,
  findByContact,
  createFromContact,
};