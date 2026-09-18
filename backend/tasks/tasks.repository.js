const pool = require("../db");

const TASK_FIELDS = [
  "id",
  "owner_id",
  "contact_id",
  "title",
  "description",
  "priority",
  "status",
  "due_date",
  "created_at",
  "updated_at",
  "contact_name",
  "contact_company",
];

function buildTaskRow(row) {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    owner_id: row.owner_id,
    contact_id: row.contact_id,
    title: row.title,
    description: row.description,
    priority: row.priority,
    status: row.status,
    due_date: row.due_date,
    created_at: row.created_at,
    updated_at: row.updated_at,
    contact_name: row.contact_name,
    contact_company: row.contact_company,
  };
}

async function contactBelongsToOwner(
  contactId,
  ownerId
) {
  const result = await pool.query(
    `
      SELECT id
      FROM contacts
      WHERE id = $1
        AND owner_id = $2
    `,
    [contactId, ownerId]
  );

  return Boolean(result.rows[0]);
}

async function findAll({
  ownerId,
  page = 1,
  limit = 20,
  status,
  priority,
  search,
}) {
  const offset = (page - 1) * limit;
  const conditions = ["t.owner_id = $1"];
  const values = [ownerId];
  let parameterIndex = 2;

  if (status) {
    conditions.push(`t.status = $${parameterIndex++}`);
    values.push(status);
  }

  if (priority) {
    conditions.push(`t.priority = $${parameterIndex++}`);
    values.push(priority);
  }

  if (search) {
    conditions.push(
      `(t.title ILIKE $${parameterIndex} OR t.description ILIKE $${parameterIndex} OR c.name ILIKE $${parameterIndex})`
    );
    values.push(`%${search}%`);
    parameterIndex++;
  }

  const whereClause = `WHERE ${conditions.join(" AND ")}`;

  const countResult = await pool.query(
    `
      SELECT COUNT(*)::int AS total
      FROM tasks t
      LEFT JOIN contacts c ON c.id = t.contact_id
      ${whereClause}
    `,
    values
  );

  const dataResult = await pool.query(
    `
      SELECT
        t.id,
        t.owner_id,
        t.contact_id,
        t.title,
        t.description,
        t.priority,
        t.status,
        t.due_date,
        t.created_at,
        t.updated_at,
        c.name AS contact_name,
        c.company AS contact_company
      FROM tasks t
      LEFT JOIN contacts c ON c.id = t.contact_id
      ${whereClause}
      ORDER BY t.due_date IS NULL, t.due_date ASC, t.created_at DESC
      LIMIT $${parameterIndex}
      OFFSET $${parameterIndex + 1}
    `,
    [...values, limit, offset]
  );

  return {
    tasks: dataResult.rows.map(buildTaskRow),
    total: countResult.rows[0].total,
  };
}

async function findById(id, ownerId) {
  const result = await pool.query(
    `
      SELECT
        t.id,
        t.owner_id,
        t.contact_id,
        t.title,
        t.description,
        t.priority,
        t.status,
        t.due_date,
        t.created_at,
        t.updated_at,
        c.name AS contact_name,
        c.company AS contact_company
      FROM tasks t
      LEFT JOIN contacts c ON c.id = t.contact_id
      WHERE t.id = $1
        AND t.owner_id = $2
    `,
    [id, ownerId]
  );

  return buildTaskRow(result.rows[0]);
}

async function create({
  ownerId,
  contactId,
  title,
  description,
  priority,
  status,
  dueDate,
}) {
  const result = await pool.query(
    `
      INSERT INTO tasks (
        owner_id,
        contact_id,
        title,
        description,
        priority,
        status,
        due_date
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING
        id,
        owner_id,
        contact_id,
        title,
        description,
        priority,
        status,
        due_date,
        created_at,
        updated_at
    `,
    [
      ownerId,
      contactId,
      title,
      description || null,
      priority,
      status,
      dueDate || null,
    ]
  );

  return buildTaskRow(result.rows[0]);
}

async function update(id, fields, ownerId) {
  if (!fields || Object.keys(fields).length === 0) {
    return null;
  }

  const setParts = [];
  const values = [];
  let parameterIndex = 1;

  for (const [key, value] of Object.entries(fields)) {
    if (TASK_FIELDS.includes(key) && key !== "id" && key !== "owner_id") {
      setParts.push(`${key} = $${parameterIndex++}`);
      values.push(value);
    }
  }

  if (setParts.length === 0) {
    return null;
  }

  values.push(id, ownerId);

  const result = await pool.query(
    `
      UPDATE tasks
      SET ${setParts.join(", ")}, updated_at = NOW()
      WHERE id = $${parameterIndex}
        AND owner_id = $${parameterIndex + 1}
      RETURNING
        id,
        owner_id,
        contact_id,
        title,
        description,
        priority,
        status,
        due_date,
        created_at,
        updated_at
    `,
    values
  );

  return buildTaskRow(result.rows[0]);
}

async function remove(id, ownerId) {
  const result = await pool.query(
    `
      DELETE FROM tasks
      WHERE id = $1
        AND owner_id = $2
      RETURNING
        id,
        owner_id,
        contact_id,
        title,
        description,
        priority,
        status,
        due_date,
        created_at,
        updated_at
    `,
    [id, ownerId]
  );

  return buildTaskRow(result.rows[0]);
}

async function getNotifications(ownerId, days = 7) {
  const result = await pool.query(
    `
      SELECT
        t.id,
        t.owner_id,
        t.contact_id,
        t.title,
        t.description,
        t.priority,
        t.status,
        t.due_date,
        t.created_at,
        t.updated_at,
        c.name AS contact_name,
        c.company AS contact_company
      FROM tasks t
      LEFT JOIN contacts c ON c.id = t.contact_id
      WHERE t.owner_id = $1
        AND t.status != 'completed'
        AND t.due_date IS NOT NULL
        AND t.due_date >= NOW()
        AND t.due_date <= NOW() + ($2 || ' days')::interval
      ORDER BY t.due_date ASC, t.created_at DESC
      LIMIT 10
    `,
    [ownerId, days]
  );

  return result.rows.map(buildTaskRow);
}

module.exports = {
  contactBelongsToOwner,
  findAll,
  findById,
  create,
  update,
  remove,
  getNotifications,
};
