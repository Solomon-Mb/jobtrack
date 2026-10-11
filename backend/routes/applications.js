const express = require("express");
const controller = require("../controllers/applicationsController");

const router = express.Router();

router.get("/", controller.getApplications);
router.get("/:id", controller.getApplication);
router.post("/", controller.createApplication);
router.put("/:id", controller.updateApplication);
router.delete("/:id", controller.deleteApplication);

module.exports = router;
