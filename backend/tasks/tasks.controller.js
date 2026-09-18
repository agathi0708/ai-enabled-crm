const service = require("./tasks.service");

function sendError(res, error) {
  const statusMap = {
    VALIDATION_ERROR: 400,
    NOT_FOUND: 404,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    CONFLICT: 409,
    RATE_LIMITED: 429,
  };

  const status = statusMap[error.code] || 500;

  return res.status(status).json({
    data: null,
    meta: {},
    error: {
      code: error.code || "INTERNAL_ERROR",
      message: error.message || "An unexpected error occurred",
    },
  });
}

async function listTasks(req, res) {
  try {
    const result = await service.listTasks({
      ownerId: req.user.id,
      page: req.query.page,
      limit: req.query.limit,
      status: req.query.status,
      priority: req.query.priority,
      search: req.query.search,
    });

    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(Number(req.query.limit) || 20, 1), 100);

    return res.status(200).json({
      data: result.tasks,
      meta: {
        page,
        limit,
        total: result.total,
        totalPages: Math.ceil(result.total / limit),
      },
      error: null,
    });
  } catch (error) {
    return sendError(res, error);
  }
}

async function createTask(req, res) {
  try {
    const task = await service.createTask(req.body, req.user.id);

    return res.status(201).json({
      data: task,
      meta: {},
      error: null,
    });
  } catch (error) {
    return sendError(res, error);
  }
}

async function updateTask(req, res) {
  try {
    const task = await service.updateTask(req.params.id, req.body, req.user.id);

    return res.status(200).json({
      data: task,
      meta: {},
      error: null,
    });
  } catch (error) {
    return sendError(res, error);
  }
}

async function deleteTask(req, res) {
  try {
    const task = await service.deleteTask(req.params.id, req.user.id);

    return res.status(200).json({
      data: task,
      meta: {},
      error: null,
    });
  } catch (error) {
    return sendError(res, error);
  }
}

async function getTaskNotifications(req, res) {
  try {
    const tasks = await service.getTaskNotifications(req.user.id, req.query.days);

    return res.status(200).json({
      data: tasks,
      meta: {
        count: tasks.length,
      },
      error: null,
    });
  } catch (error) {
    return sendError(res, error);
  }
}

module.exports = {
  listTasks,
  createTask,
  updateTask,
  deleteTask,
  getTaskNotifications,
};
