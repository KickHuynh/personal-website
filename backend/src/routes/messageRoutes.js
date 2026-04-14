const express = require("express");
const router = express.Router();
const messageController = require("../controllers/messageController");
const { requireAdmin, verifyToken } = require("../middlewares/authMiddleware");
const { contactFormLimiter } = require("../middlewares/rateLimiter");

router.get("/", verifyToken, requireAdmin, messageController.getAllMessages);
router.post("/", contactFormLimiter, messageController.createMessage);
router.patch("/:id/read", verifyToken, requireAdmin, messageController.updateMessageReadState);
router.delete("/:id", verifyToken, requireAdmin, messageController.deleteMessage);

module.exports = router;
