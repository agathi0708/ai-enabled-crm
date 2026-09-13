const express = require("express");
const multer = require("multer");

const controller = require("./contacts.controller");
const activitiesController = require("../activities/activities.controller");
const { requireAuth } = require("../auth/auth.middleware");

const router = express.Router();

/**
 * CSV upload configuration.
 */
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
  requireAuth,
  controller.listContacts
);

/**
 * POST /api/v1/contacts
 */
router.post(
  "/",
  requireAuth,
  controller.createContact
);

/**
 * POST /api/v1/contacts/import
 */
router.post(
  "/import",
  requireAuth,
  upload.single("file"),
  controller.importContacts
);

/**
 * POST /api/v1/contacts/:id/convert
 */
router.post(
  "/:id/convert",
  requireAuth,
  controller.convertContactToDeal
);

/**
 * GET /api/v1/contacts/:id/activities
 */
router.get(
  "/:id/activities",
  requireAuth,
  activitiesController.listContactActivities
);

/**
 * GET /api/v1/contacts/:id
 */
router.get(
  "/:id",
  requireAuth,
  controller.getContact
);

/**
 * PUT /api/v1/contacts/:id
 */
router.put(
  "/:id",
  requireAuth,
  controller.updateContact
);

/**
 * DELETE /api/v1/contacts/:id
 */
router.delete(
  "/:id",
  requireAuth,
  controller.deleteContact
);

module.exports = router;