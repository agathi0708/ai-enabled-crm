const pool = require("../db");
const repository = require("./deals.repository");

const VALID_STAGES = [
  "new",
  "qualified",
  "proposal",
  "negotiation",
  "won",
  "lost",
];

/**
 * List deals for the authenticated user.
 */
async function listDeals({
  page = 1,
  limit = 20,
  stage,
  search,
  ownerId,
}) {
  if (!ownerId) {
    const error = new Error(
      "Authenticated owner is required"
    );

    error.code = "UNAUTHORIZED";

    throw error;
  }

  return repository.findAll({
    page,
    limit,
    stage,
    search,
    ownerId,
  });
}

/**
 * Create a new deal for an authenticated user's contact.
 */
async function createDeal({
  ownerId,
  contactId,
  name,
  amount,
  stage = "new",
}) {
  if (!ownerId) {
    const error = new Error(
      "Authenticated owner is required"
    );

    error.code = "UNAUTHORIZED";

    throw error;
  }

  if (!contactId) {
    const error = new Error(
      "Contact ID is required"
    );

    error.code = "VALIDATION_ERROR";

    throw error;
  }

  if (!name || !String(name).trim()) {
    const error = new Error(
      "Deal name is required"
    );

    error.code = "VALIDATION_ERROR";

    throw error;
  }

  if (
    amount === undefined ||
    amount === null ||
    amount === "" ||
    Number.isNaN(Number(amount))
  ) {
    const error = new Error(
      "Deal amount must be a valid number"
    );

    error.code = "VALIDATION_ERROR";

    throw error;
  }

  const normalizedStage =
    String(stage || "new")
      .toLowerCase()
      .trim();

  if (!VALID_STAGES.includes(normalizedStage)) {
    const error = new Error(
      `Invalid deal stage. Allowed stages: ${VALID_STAGES.join(", ")}`
    );

    error.code = "VALIDATION_ERROR";

    throw error;
  }

  const deal =
    await repository.createDeal({
      ownerId,
      contactId,
      name: String(name).trim(),
      amount: Number(amount),
      stage: normalizedStage,
    });

  if (!deal) {
    const error = new Error(
      "Contact not found"
    );

    error.code = "NOT_FOUND";

    throw error;
  }

  return deal;
}

/**
 * Update deal details for an authenticated user's deal.
 */
async function updateDeal({
  dealId,
  ownerId,
  name,
  amount,
  stage,
}) {
  if (!ownerId) {
    const error = new Error(
      "Authenticated owner is required"
    );

    error.code = "UNAUTHORIZED";

    throw error;
  }

  if (!dealId) {
    const error = new Error(
      "Deal ID is required"
    );

    error.code = "VALIDATION_ERROR";

    throw error;
  }

  if (name !== undefined) {
    if (!String(name).trim()) {
      const error = new Error(
        "Deal name cannot be empty"
      );

      error.code = "VALIDATION_ERROR";

      throw error;
    }
  }

  if (amount !== undefined) {
    if (
      amount === null ||
      amount === "" ||
      Number.isNaN(Number(amount))
    ) {
      const error = new Error(
        "Deal amount must be a valid number"
      );

      error.code = "VALIDATION_ERROR";

      throw error;
    }
  }

  let normalizedStage;

  if (stage !== undefined) {
    normalizedStage =
      String(stage)
        .toLowerCase()
        .trim();

    if (!VALID_STAGES.includes(normalizedStage)) {
      const error = new Error(
        `Invalid deal stage. Allowed stages: ${VALID_STAGES.join(", ")}`
      );

      error.code = "VALIDATION_ERROR";

      throw error;
    }
  }

  const deal =
    await repository.updateDeal({
      dealId,
      ownerId,
      name:
        name !== undefined
          ? String(name).trim()
          : undefined,
      amount:
        amount !== undefined
          ? Number(amount)
          : undefined,
      stage: normalizedStage,
    });

  if (!deal) {
    const error = new Error(
      "Deal not found"
    );

    error.code = "NOT_FOUND";

    throw error;
  }

  return deal;
}

/**
 * Delete an authenticated user's deal.
 */
async function deleteDeal({
  dealId,
  ownerId,
}) {
  if (!ownerId) {
    const error = new Error(
      "Authenticated owner is required"
    );

    error.code = "UNAUTHORIZED";

    throw error;
  }

  if (!dealId) {
    const error = new Error(
      "Deal ID is required"
    );

    error.code = "VALIDATION_ERROR";

    throw error;
  }

  const deal =
    await repository.deleteDeal({
      dealId,
      ownerId,
    });

  if (!deal) {
    const error = new Error(
      "Deal not found"
    );

    error.code = "NOT_FOUND";

    throw error;
  }

  return deal;
}

/**
 * Update the pipeline stage of an authenticated user's deal.
 */
async function updateDealStage({
  dealId,
  stage,
  ownerId,
}) {
  if (!ownerId) {
    const error = new Error(
      "Authenticated owner is required"
    );

    error.code = "UNAUTHORIZED";

    throw error;
  }

  if (!dealId) {
    const error = new Error(
      "Deal ID is required"
    );

    error.code = "VALIDATION_ERROR";

    throw error;
  }

  if (!stage) {
    const error = new Error(
      "Deal stage is required"
    );

    error.code = "VALIDATION_ERROR";

    throw error;
  }

  const normalizedStage =
    String(stage).toLowerCase().trim();

  if (!VALID_STAGES.includes(normalizedStage)) {
    const error = new Error(
      `Invalid deal stage. Allowed stages: ${VALID_STAGES.join(", ")}`
    );

    error.code = "VALIDATION_ERROR";

    throw error;
  }

  const deal =
    await repository.updateStage({
      dealId,
      stage: normalizedStage,
      ownerId,
    });

  if (!deal) {
    const error = new Error(
      "Deal not found"
    );

    error.code = "NOT_FOUND";

    throw error;
  }

  return deal;
}

/**
 * Convert an authenticated user's contact
 * into a deal.
 *
 * The entire operation is transactional.
 */
async function convertContactToDeal(
  contactId,
  ownerId
) {
  if (!ownerId) {
    const error = new Error(
      "Authenticated owner is required"
    );

    error.code = "UNAUTHORIZED";

    throw error;
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const contactResult =
      await client.query(
        `
          SELECT
            id,
            owner_id,
            name,
            company,
            status
          FROM contacts
          WHERE id = $1
            AND owner_id = $2
          FOR UPDATE
        `,
        [
          contactId,
          ownerId,
        ]
      );

    const contact =
      contactResult.rows[0];

    if (!contact) {
      const error = new Error(
        "Contact not found"
      );

      error.code = "NOT_FOUND";

      throw error;
    }

    const existingDeal =
      await repository.findByContact(
        client,
        ownerId,
        contactId
      );

    if (existingDeal) {
      if (
        contact.status !== "converted"
      ) {
        await client.query(
          `
            UPDATE contacts
            SET
              status = 'converted',
              updated_at = NOW()
            WHERE id = $1
              AND owner_id = $2
          `,
          [
            contactId,
            ownerId,
          ]
        );
      }

      await client.query("COMMIT");

      return {
        deal: existingDeal,
        alreadyConverted: true,
      };
    }

    const dealName = contact.company
      ? `${contact.name} - ${contact.company}`
      : contact.name;

    const deal =
      await repository.createFromContact(
        client,
        {
          ownerId,
          contactId,
          name: dealName,
        }
      );

    await client.query(
      `
        UPDATE contacts
        SET
          status = 'converted',
          updated_at = NOW()
        WHERE id = $1
          AND owner_id = $2
      `,
      [
        contactId,
        ownerId,
      ]
    );

    await client.query("COMMIT");

    return {
      deal,
      alreadyConverted: false,
    };
  } catch (error) {
    try {
      await client.query("ROLLBACK");
    } catch {
      // Ignore rollback errors.
    }

    if (error.code === "23505") {
      const conflict = new Error(
        "Contact has already been converted into a deal"
      );

      conflict.code = "CONFLICT";

      throw conflict;
    }

    throw error;
  } finally {
    client.release();
  }
}

module.exports = {
  listDeals,
  createDeal,
  updateDeal,
  deleteDeal,
  updateDealStage,
  convertContactToDeal,
};