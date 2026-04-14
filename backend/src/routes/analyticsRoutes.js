const express = require("express");
const router = express.Router();

const analyticsController = require("../controllers/analyticsController");
const { requireAdmin, verifyToken } = require("../middlewares/authMiddleware");

router.post("/", analyticsController.trackEvent);
router.get("/summary", verifyToken, requireAdmin, analyticsController.getAnalyticsOverview);

module.exports = router;
