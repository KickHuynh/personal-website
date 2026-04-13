const express = require("express");
const router = express.Router();
const messageController = require("../controllers/messageController");
const { verifyToken } = require("../middlewares/authMiddleware");
const { contactFormLimiter } = require("../middlewares/rateLimiter");

router.get("/", verifyToken, messageController.getAllMessages);
// Áp dụng strict rate limiter riêng cho route POST contact form
router.post("/", contactFormLimiter, messageController.createMessage);
router.delete("/:id", verifyToken, messageController.deleteMessage);

module.exports = router;
