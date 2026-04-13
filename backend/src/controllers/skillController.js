const skillModel = require("../models/skillModel");

const getAllSkills = async (req, res) => {
  try {
    const skills = await skillModel.getAllSkills();

    return res.status(200).json({
      success: true,
      message: "Lấy danh sách kỹ năng thành công",
      data: skills
    });
  } catch (error) {
    console.error("Get skills error:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi server khi lấy danh sách kỹ năng",
      error: error.message
    });
  }
};

const getSkillById = async (req, res) => {
  try {
    const { id } = req.params;
    const skill = await skillModel.getSkillById(id);

    if (!skill) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy kỹ năng"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Lấy chi tiết kỹ năng thành công",
      data: skill
    });
  } catch (error) {
    console.error("Get skill by id error:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi server khi lấy chi tiết kỹ năng",
      error: error.message
    });
  }
};

const createSkill = async (req, res) => {
  try {
    const { name, level, category } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Tên kỹ năng là bắt buộc"
      });
    }

    const result = await skillModel.createSkill({
      name,
      level: level || null,
      category: category || null
    });

    return res.status(201).json({
      success: true,
      message: "Thêm kỹ năng thành công",
      data: {
        id: result.insertId,
        name,
        level: level || null,
        category: category || null
      }
    });
  } catch (error) {
    console.error("Create skill error:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi server khi thêm kỹ năng",
      error: error.message
    });
  }
};

const updateSkill = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, level, category } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Tên kỹ năng là bắt buộc"
      });
    }

    const existingSkill = await skillModel.getSkillById(id);

    if (!existingSkill) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy skill để cập nhật"
      });
    }

    const result = await skillModel.updateSkillById(id, {
      name,
      level: level || null,
      category: category || null
    });

    return res.status(200).json({
      success: true,
      message: "Cập nhật skill thành công",
      data: {
        affectedRows: result.affectedRows
      }
    });
  } catch (error) {
    console.error("Update skill error:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi server khi cập nhật skill",
      error: error.message
    });
  }
};

const deleteSkill = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await skillModel.deleteSkillById(id);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy skill để xóa"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Xóa skill thành công"
    });
  } catch (error) {
    console.error("Delete skill error:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi server khi xóa skill",
      error: error.message
    });
  }
};

module.exports = {
  getAllSkills,
  getSkillById,
  createSkill,
  updateSkill,
  deleteSkill
};
