const express = require("express");
const router = express.Router();
const skillController = require("../controllers/skillController");
const { requireAdmin, verifyToken } = require("../middlewares/authMiddleware");

router.get("/", skillController.getAllSkills);
router.get("/:id", verifyToken, requireAdmin, skillController.getSkillById);

router.post("/", verifyToken, requireAdmin, skillController.createSkill);
router.put("/:id", verifyToken, requireAdmin, skillController.updateSkill);
router.delete("/:id", verifyToken, requireAdmin, skillController.deleteSkill);

module.exports = router;
