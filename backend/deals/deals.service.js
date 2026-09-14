const pool = require("../db");
const repository = require("./deals.repository");

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
  convertContactToDeal,
};