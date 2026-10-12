const express = require("express");
const controller = require("../controllers/applicationsController");
const { requireAuth } = require("../middleware/authMiddleware");

const router = express.Router();

// Every applications route requires a logged-in user
router.use(requireAuth);

router.get("/", controller.getApplications);
router.get("/:id", controller.getApplication);
router.post("/", controller.createApplication);
router.put("/:id", controller.updateApplication);
router.delete("/:id", controller.deleteApplication);

module.exports = router;
