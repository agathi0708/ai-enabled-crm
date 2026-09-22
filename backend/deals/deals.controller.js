const service = require("./deals.service");

function sendError(res, error) {
  const statusMap = {
    VALIDATION_ERROR: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
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

function getAuthenticatedUser(req) {
  if (!req.user || !req.user.id) {
    const error = new Error(
      "Authenticated user is required"
    );

    error.code = "UNAUTHORIZED";

    throw error;
  }

  return req.user;
}

/**
 * GET /api/v1/deals
 */
async function listDeals(req, res) {
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
      await service.listDeals({
        page,
        limit,
        stage: req.query.stage,
        search: req.query.search,
        ownerId: user.id,
      });

    return res.status(200).json({
      data: result.deals,
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
 * POST /api/v1/deals
 */
async function createDeal(req, res) {
  try {
    const user =
      getAuthenticatedUser(req);

    const result =
      await service.createDeal({
        ownerId: user.id,
        contactId: req.body?.contactId,
        name: req.body?.name,
        amount: req.body?.amount,
        stage: req.body?.stage,
      });

    return res.status(201).json({
      data: result,
      meta: {},
      error: null,
    });
  } catch (error) {
    return sendError(res, error);
  }
}

/**
 * PATCH /api/v1/deals/:id
 *
 * Update deal details.
 */
async function updateDeal(req, res) {
  try {
    const user =
      getAuthenticatedUser(req);

    const result =
      await service.updateDeal({
        dealId: req.params.id,
        ownerId: user.id,
        name: req.body?.name,
        amount: req.body?.amount,
        stage: req.body?.stage,
      });

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
 * DELETE /api/v1/deals/:id
 *
 * Delete a deal.
 */
async function deleteDeal(req, res) {
  try {
    const user =
      getAuthenticatedUser(req);

    const result =
      await service.deleteDeal({
        dealId: req.params.id,
        ownerId: user.id,
      });

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
 * POST /api/v1/deals/from-contact/:id
 */
async function convertFromContact(
  req,
  res
) {
  try {
    const user =
      getAuthenticatedUser(req);

    const result =
      await service.convertContactToDeal(
        req.params.id,
        user.id
      );

    return res
      .status(
        result.alreadyConverted
          ? 200
          : 201
      )
      .json({
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

/**
 * PATCH /api/v1/deals/:id/stage
 */
async function updateStage(req, res) {
  try {
    const user =
      getAuthenticatedUser(req);

    const result =
      await service.updateDealStage({
        dealId: req.params.id,
        stage: req.body?.stage,
        ownerId: user.id,
      });

    return res.status(200).json({
      data: result,
      meta: {},
      error: null,
    });
  } catch (error) {
    return sendError(res, error);
  }
}

module.exports = {
  listDeals,
  createDeal,
  updateDeal,
  deleteDeal,
  convertFromContact,
  updateStage,
};