const service = require("./contacts.service");
const importService = require("./contacts.import.service");
const dealsService = require("../deals/deals.service");

const {
  validateCreateContact,
  validateUpdateContact,
  validateContactId,
} = require("./contacts.validation");

/**
 * Convert application errors into the standard API error response.
 */
function sendError(res, error) {
  const statusMap = {
    VALIDATION_ERROR: 400,
    NOT_FOUND: 404,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    CONFLICT: 409,
    RATE_LIMITED: 429,
  };

  const status =
    statusMap[error.code] || 500;

  return res.status(status).json({
    data: null,
    meta: {},
    error: {
      code:
        error.code ||
        "INTERNAL_ERROR",
      message:
        error.message ||
        "An unexpected error occurred",
    },
  });
}

/**
 * Require the authentication middleware
 * to have populated req.user.
 */
function getAuthenticatedUser(req) {
  if (
    !req.user ||
    !req.user.id
  ) {
    const error = new Error(
      "Authenticated user is required"
    );

    error.code = "UNAUTHORIZED";

    throw error;
  }

  return req.user;
}

/**
 * GET /api/v1/contacts
 *
 * Contacts are scoped to the authenticated user.
 */
async function listContacts(req, res) {
  try {
    const user =
      getAuthenticatedUser(req);

    const page = Math.max(
      Number(req.query.page) || 1,
      1
    );

    const limit = Math.min(
      Math.max(
        Number(req.query.limit) || 20,
        1
      ),
      100
    );

    const result =
      await service.listContacts({
        page,
        limit,
        status: req.query.status,
        tag: req.query.tag,
        search: req.query.search,
        ownerId: user.id,
      });

    return res.status(200).json({
      data: result.contacts,
      meta: {
        page,
        limit,
        total: result.total,
        totalPages: Math.ceil(
          result.total / limit
        ),
      },
      error: null,
    });
  } catch (error) {
    return sendError(res, error);
  }
}

/**
 * GET /api/v1/contacts/:id
 */
async function getContact(req, res) {
  try {
    const user =
      getAuthenticatedUser(req);

    validateContactId(
      req.params.id
    );

    const contact =
      await service.getContactById(
        req.params.id,
        user.id
      );

    if (!contact) {
      const error = new Error(
        "Contact not found"
      );

      error.code = "NOT_FOUND";

      return sendError(res, error);
    }

    return res.status(200).json({
      data: contact,
      meta: {},
      error: null,
    });
  } catch (error) {
    return sendError(res, error);
  }
}

/**
 * POST /api/v1/contacts
 */
async function createContact(req, res) {
  try {
    const user =
      getAuthenticatedUser(req);

    validateCreateContact(
      req.body
    );

    const contact =
      await service.createContact(
        req.body,
        user.id
      );

    return res.status(201).json({
      data: contact,
      meta: {},
      error: null,
    });
  } catch (error) {
    return sendError(res, error);
  }
}

/**
 * PUT /api/v1/contacts/:id
 */
async function updateContact(req, res) {
  try {
    const user =
      getAuthenticatedUser(req);

    validateContactId(
      req.params.id
    );

    validateUpdateContact(
      req.body
    );

    const contact =
      await service.updateContact(
        req.params.id,
        req.body,
        user.id
      );

    if (!contact) {
      const error = new Error(
        "Contact not found"
      );

      error.code = "NOT_FOUND";

      return sendError(res, error);
    }

    return res.status(200).json({
      data: contact,
      meta: {},
      error: null,
    });
  } catch (error) {
    return sendError(res, error);
  }
}

/**
 * DELETE /api/v1/contacts/:id
 */
async function deleteContact(req, res) {
  try {
    const user =
      getAuthenticatedUser(req);

    validateContactId(
      req.params.id
    );

    const deleted =
      await service.deleteContact(
        req.params.id,
        user.id
      );

    if (!deleted) {
      const error = new Error(
        "Contact not found"
      );

      error.code = "NOT_FOUND";

      return sendError(res, error);
    }

    return res.status(204).send();
  } catch (error) {
    return sendError(res, error);
  }
}

/**
 * POST /api/v1/contacts/import
 *
 * Owner is always taken from the JWT.
 */
async function importContacts(req, res) {
  try {
    const user =
      getAuthenticatedUser(req);

    if (!req.file) {
      const error = new Error(
        "CSV file is required"
      );

      error.code = "VALIDATION_ERROR";

      return sendError(
        res,
        error
      );
    }

    const result =
      await importService.importContacts(
        req.file.buffer,
        user.id
      );

    return res.status(200).json({
      data: result,
      meta: {},
      error: null,
    });
  } catch (error) {
    return sendError(res, error);
  }
}

/**
 * POST /api/v1/contacts/:id/convert
 *
 * Convert an authenticated user's
 * contact/lead into a deal.
 */
async function convertContactToDeal(
  req,
  res
) {
  try {
    const user =
      getAuthenticatedUser(req);

    validateContactId(
      req.params.id
    );

    const result =
      await dealsService.convertContactToDeal(
        req.params.id,
        user.id
      );

    return res.status(
      result.alreadyConverted
        ? 200
        : 201
    ).json({
      data: result.deal,
      meta: {
        alreadyConverted:
          result.alreadyConverted,
      },
      error: null,
    });
  } catch (error) {
    return sendError(
      res,
      error
    );
  }
}

module.exports = {
  listContacts,
  getContact,
  createContact,
  updateContact,
  deleteContact,
  importContacts,
  convertContactToDeal,
};