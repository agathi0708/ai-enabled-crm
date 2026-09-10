const express = require("express");
const multer = require("multer");

const controller = require("./contacts.controller");
const activitiesController = require("../activities/activities.controller");

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),

  limits: {
    fileSize: 5 * 1024 * 1024,
  },

  fileFilter: (req, file, cb) => {
    const isCsv =
      file.mimetype === "text/csv" ||
      file.originalname
        .toLowerCase()
        .endsWith(".csv");

    if (!isCsv) {
      return cb(
        new Error("Only CSV files are allowed")
      );
    }

    cb(null, true);
  },
});

/**
 * GET /api/v1/contacts
 */
router.get(
  "/",
  controller.listContacts
);

/**
 * POST /api/v1/contacts
 */
router.post(
  "/",
  controller.createContact
);

/**
 * POST /api/v1/contacts/import
 */
router.post(
  "/import",
  upload.single("file"),
  controller.importContacts
);

/**
 * POST /api/v1/contacts/:id/convert
 *
 * Convert a lead/contact into a deal.
 *
 * This route must be before /:id so that
 * "/:id/convert" is matched correctly.
 */
router.post(
  "/:id/convert",
  controller.convertContactToDeal
);

/**
 * GET /api/v1/contacts/:id/activities
 *
 * Must be before /:id.
 */
router.get(
  "/:id/activities",
  activitiesController.listContactActivities
);

/**
 * GET /api/v1/contacts/:id
 */
router.get(
  "/:id",
  controller.getContact
);

/**
 * PUT /api/v1/contacts/:id
 */
router.put(
  "/:id",
  controller.updateContact
);

/**
 * DELETE /api/v1/contacts/:id
 */
router.delete(
  "/:id",
  controller.deleteContact
);

module.exports = router;