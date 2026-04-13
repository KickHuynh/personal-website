const messageModel = require("../models/messageModel");

const createMessage = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        message: "Name, email và message là bắt buộc"
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Email không hợp lệ"
      });
    }

    const result = await messageModel.createMessage({
      name,
      email,
      subject: subject || null,
      message
    });

    return res.status(201).json({
      success: true,
      message: "Gửi liên hệ thành công",
      data: {
        id: result.insertId,
        name,
        email,
        subject: subject || null,
        message
      }
    });
  } catch (error) {
    console.error("Create message error:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi server khi lưu liên hệ",
      error: error.message
    });
  }
};

const getAllMessages = async (req, res) => {
  try {
    const messages = await messageModel.getAllMessages();

    return res.status(200).json({
      success: true,
      message: "Lấy danh sách liên hệ thành công",
      data: messages
    });
  } catch (error) {
    console.error("Get messages error:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi server khi lấy danh sách liên hệ",
      error: error.message
    });
  }
};

const deleteMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await messageModel.deleteMessageById(id);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy message để xóa"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Xóa message thành công"
    });
  } catch (error) {
    console.error("Delete message error:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi server khi xóa message",
      error: error.message
    });
  }
};

module.exports = {
  createMessage,
  getAllMessages,
  deleteMessage
};
