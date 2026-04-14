const express = require("express");
const router = express.Router();

const uploadController = require("../controllers/uploadController");
const { requireAdmin, verifyToken } = require("../middlewares/authMiddleware");

router.post("/image", verifyToken, requireAdmin, uploadController.uploadImage);

module.exports = router;
