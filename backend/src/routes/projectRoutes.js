const express = require("express");
const router = express.Router();
const projectController = require("../controllers/projectController");
const { requireAdmin, verifyToken } = require("../middlewares/authMiddleware");

router.get("/admin/all", verifyToken, requireAdmin, projectController.getAdminProjects);
router.get("/slug/:slug", projectController.getProjectBySlug);
router.get("/", projectController.getPublicProjects);
router.get("/:id", verifyToken, requireAdmin, projectController.getProjectById);

router.post("/", verifyToken, requireAdmin, projectController.createProject);
router.put("/:id", verifyToken, requireAdmin, projectController.updateProject);
router.patch("/:id/status", verifyToken, requireAdmin, projectController.updateProjectStatus);
router.patch("/:id/featured", verifyToken, requireAdmin, projectController.updateProjectFeatured);
router.delete("/:id", verifyToken, requireAdmin, projectController.deleteProject);

module.exports = router;
