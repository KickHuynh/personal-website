const express = require("express");
const router = express.Router();
const skillController = require("../controllers/skillController");
const { verifyToken } = require("../middlewares/authMiddleware");

router.get("/", skillController.getAllSkills);
router.get("/:id", skillController.getSkillById);

router.post("/", verifyToken, skillController.createSkill);
router.put("/:id", verifyToken, skillController.updateSkill);
router.delete("/:id", verifyToken, skillController.deleteSkill);

module.exports = router;
