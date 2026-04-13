const projectModel = require("../models/projectModel");

const getAllProjects = async (req, res) => {
  try {
    const projects = await projectModel.getAllProjects();

    return res.status(200).json({
      success: true,
      message: "Lấy danh sách dự án thành công",
      data: projects
    });
  } catch (error) {
    console.error("Get projects error:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi server khi lấy danh sách dự án",
      error: error.message
    });
  }
};

const getProjectById = async (req, res) => {
  try {
    const { id } = req.params;
    const project = await projectModel.getProjectById(id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy dự án"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Lấy chi tiết dự án thành công",
      data: project
    });
  } catch (error) {
    console.error("Get project by id error:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi server khi lấy chi tiết dự án",
      error: error.message
    });
  }
};

const createProject = async (req, res) => {
  try {
    const {
      title,
      description,
      tech_stack,
      github_url,
      demo_url,
      image_url
    } = req.body;

    if (!title || !description) {
      return res.status(400).json({
        success: false,
        message: "Title và description là bắt buộc"
      });
    }

    const result = await projectModel.createProject({
      title,
      description,
      tech_stack: tech_stack || null,
      github_url: github_url || null,
      demo_url: demo_url || null,
      image_url: image_url || null
    });

    return res.status(201).json({
      success: true,
      message: "Thêm dự án thành công",
      data: {
        id: result.insertId,
        title,
        description,
        tech_stack: tech_stack || null,
        github_url: github_url || null,
        demo_url: demo_url || null,
        image_url: image_url || null
      }
    });
  } catch (error) {
    console.error("Create project error:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi server khi thêm dự án",
      error: error.message
    });
  }
};

const updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      tech_stack,
      github_url,
      demo_url,
      image_url
    } = req.body;

    if (!title || !description) {
      return res.status(400).json({
        success: false,
        message: "Title và description là bắt buộc"
      });
    }

    const existingProject = await projectModel.getProjectById(id);

    if (!existingProject) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy project để cập nhật"
      });
    }

    const result = await projectModel.updateProjectById(id, {
      title,
      description,
      tech_stack: tech_stack || null,
      github_url: github_url || null,
      demo_url: demo_url || null,
      image_url: image_url || null
    });

    return res.status(200).json({
      success: true,
      message: "Cập nhật project thành công",
      data: {
        affectedRows: result.affectedRows
      }
    });
  } catch (error) {
    console.error("Update project error:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi server khi cập nhật project",
      error: error.message
    });
  }
};

const deleteProject = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await projectModel.deleteProjectById(id);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy project để xóa"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Xóa project thành công"
    });
  } catch (error) {
    console.error("Delete project error:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi server khi xóa project",
      error: error.message
    });
  }
};

module.exports = {
  getAllProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject
};
