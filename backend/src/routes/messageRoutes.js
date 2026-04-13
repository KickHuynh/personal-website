const express = require("express");
const router = express.Router();
const messageController = require("../controllers/messageController");
const { verifyToken } = require("../middlewares/authMiddleware");

router.get("/", verifyToken, messageController.getAllMessages);
router.post("/", messageController.createMessage);
router.delete("/:id", verifyToken, messageController.deleteMessage);

module.exports = router;
