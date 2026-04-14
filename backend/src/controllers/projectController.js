const projectModel = require("../models/projectModel");
const { createHttpError } = require("../utils/httpErrors");
const {
  formatProjectRecord,
  normalizeProjectPayload,
} = require("../utils/projectFields");

async function ensureUniqueSlug(slug, currentId = null) {
  if (!slug) return;

  const existingProject = await projectModel.getProjectBySlug(slug, { includeDrafts: true });
  if (existingProject && String(existingProject.id) !== String(currentId)) {
    throw createHttpError(409, "Slug dự án đã tồn tại");
  }
}

async function requireProjectById(id) {
  const project = await projectModel.getProjectById(id);
  if (!project) {
    throw createHttpError(404, "Không tìm thấy dự án");
  }
  return project;
}

const getPublicProjects = async (_req, res, next) => {
  try {
    const projects = await projectModel.listProjects({ includeDrafts: false });

    return res.status(200).json({
      success: true,
      message: "Lấy danh sách case study thành công",
      data: projects.map(formatProjectRecord),
    });
  } catch (error) {
    next(error);
  }
};

const getAdminProjects = async (_req, res, next) => {
  try {
    const projects = await projectModel.listProjects({ includeDrafts: true });

    return res.status(200).json({
      success: true,
      message: "Lấy danh sách project quản trị thành công",
      data: projects.map(formatProjectRecord),
    });
  } catch (error) {
    next(error);
  }
};

const getProjectBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const project = await projectModel.getProjectBySlug(slug, { includeDrafts: false });

    if (!project) {
      throw createHttpError(404, "Không tìm thấy case study");
    }

    return res.status(200).json({
      success: true,
      message: "Lấy chi tiết case study thành công",
      data: formatProjectRecord(project),
    });
  } catch (error) {
    next(error);
  }
};

const getProjectById = async (req, res, next) => {
  try {
    const project = await requireProjectById(req.params.id);

    return res.status(200).json({
      success: true,
      message: "Lấy chi tiết dự án thành công",
      data: formatProjectRecord(project),
    });
  } catch (error) {
    next(error);
  }
};

const createProject = async (req, res, next) => {
  try {
    const payload = normalizeProjectPayload(req.body);

    if (!payload.title || !payload.description) {
      throw createHttpError(400, "Title và mô tả ngắn là bắt buộc");
    }

    if (!payload.slug) {
      throw createHttpError(400, "Slug không hợp lệ");
    }

    await ensureUniqueSlug(payload.slug);
    const result = await projectModel.createProject(payload);
    const createdProject = await projectModel.getProjectById(result.insertId);

    return res.status(201).json({
      success: true,
      message: "Thêm case study thành công",
      data: formatProjectRecord(createdProject),
    });
  } catch (error) {
    next(error);
  }
};

const updateProject = async (req, res, next) => {
  try {
    const { id } = req.params;
    const payload = normalizeProjectPayload(req.body);

    if (!payload.title || !payload.description) {
      throw createHttpError(400, "Title và mô tả ngắn là bắt buộc");
    }

    await requireProjectById(id);
    await ensureUniqueSlug(payload.slug, id);
    await projectModel.updateProjectById(id, payload);
    const updatedProject = await projectModel.getProjectById(id);

    return res.status(200).json({
      success: true,
      message: "Cập nhật case study thành công",
      data: formatProjectRecord(updatedProject),
    });
  } catch (error) {
    next(error);
  }
};

const updateProjectStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const status = req.body.status === "draft" ? "draft" : "published";

    await requireProjectById(id);
    await projectModel.updateProjectStatusById(id, status);
    const updatedProject = await projectModel.getProjectById(id);

    return res.status(200).json({
      success: true,
      message: status === "draft" ? "Đã chuyển project về draft" : "Đã publish project",
      data: formatProjectRecord(updatedProject),
    });
  } catch (error) {
    next(error);
  }
};

const updateProjectFeatured = async (req, res, next) => {
  try {
    const { id } = req.params;
    const featured = Boolean(req.body.featured);

    await requireProjectById(id);
    await projectModel.updateProjectFeaturedById(id, featured);
    const updatedProject = await projectModel.getProjectById(id);

    return res.status(200).json({
      success: true,
      message: featured ? "Đã đánh dấu featured" : "Đã bỏ featured",
      data: formatProjectRecord(updatedProject),
    });
  } catch (error) {
    next(error);
  }
};

const deleteProject = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await projectModel.deleteProjectById(id);

    if (result.affectedRows === 0) {
      throw createHttpError(404, "Không tìm thấy project để xóa");
    }

    return res.status(200).json({
      success: true,
      message: "Xóa project thành công",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPublicProjects,
  getAdminProjects,
  getProjectBySlug,
  getProjectById,
  createProject,
  updateProject,
  updateProjectStatus,
  updateProjectFeatured,
  deleteProject,
};
