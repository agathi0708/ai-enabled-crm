const { parse } = require("csv-parse/sync");

const repository = require("./contacts.repository");
const { validateCreateContact } = require("./contacts.validation");

const MAX_ROWS = 5000;

function parseTags(value) {
  if (!value) {
    return [];
  }

  return String(value)
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
}

async function importContacts(csvBuffer, ownerId) {
  if (!ownerId) {
    const error = new Error("Owner ID is required for CSV import");
    error.code = "VALIDATION_ERROR";
    throw error;
  }

  let rows;

  try {
    rows = parse(csvBuffer, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
      bom: true,
    });
  } catch (error) {
    const parseError = new Error(
      `Invalid CSV format: ${error.message}`
    );
    parseError.code = "VALIDATION_ERROR";
    throw parseError;
  }

  if (rows.length > MAX_ROWS) {
    const error = new Error(
      `CSV cannot contain more than ${MAX_ROWS} rows`
    );
    error.code = "VALIDATION_ERROR";
    throw error;
  }

  let imported = 0;
  let failed = 0;
  const errors = [];

  for (let index = 0; index < rows.length; index++) {
    const rowNumber = index + 2;

    try {
      const row = rows[index];

      const contact = {
        ownerId,

        name: row.name,

        company: row.company || undefined,
        email: row.email || undefined,
        phone: row.phone || undefined,
        status: row.status || "new",
        tags: parseTags(row.tags),
        source: row.source || undefined,
        notes: row.notes || undefined,
      };

      validateCreateContact(contact);

      await repository.create(contact);

      imported++;
    } catch (error) {
      failed++;

      errors.push({
        row: rowNumber,
        message: error.message || "Invalid row",
      });
    }
  }

  return {
    imported,
    failed,
    errors,
  };
}

module.exports = {
  importContacts,
};