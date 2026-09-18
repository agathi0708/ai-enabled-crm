const express = require("express");

const controller = require("./tasks.controller");

const router = express.Router();

router.get("/notifications", controller.getTaskNotifications);
router.get("/", controller.listTasks);
router.post("/", controller.createTask);
router.patch("/:id", controller.updateTask);
router.delete("/:id", controller.deleteTask);

module.exports = router;
