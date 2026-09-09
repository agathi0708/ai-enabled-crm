const express = require("express");
const controller = require("./contacts.controller");

const router = express.Router();

router.get("/", controller.listContacts);
router.post("/", controller.createContact);

router.get("/:id", controller.getContact);
router.put("/:id", controller.updateContact);
router.delete("/:id", controller.deleteContact);

module.exports = router;