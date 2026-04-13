const express = require("express");
const router = express.Router();
const projectController = require("../controllers/projectController");
const { verifyToken } = require("../middlewares/authMiddleware");

router.get("/", projectController.getAllProjects);
router.get("/:id", projectController.getProjectById);

router.post("/", verifyToken, projectController.createProject);
router.put("/:id", verifyToken, projectController.updateProject);
router.delete("/:id", verifyToken, projectController.deleteProject);

module.exports = router;
