const analyticsModel = require("../models/analyticsModel");
const messageModel = require("../models/messageModel");
const { createHttpError } = require("../utils/httpErrors");

const createMessage = async (req, res, next) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !message) {
      throw createHttpError(400, "Name, email và message là bắt buộc");
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw createHttpError(400, "Email không hợp lệ");
    }

    const result = await messageModel.createMessage({
      name,
      email,
      subject: subject || null,
      message,
    });

    await analyticsModel.createEvent({
      event_type: "contact_submit",
      page_path: req.body.page_path || "/#contact",
      project_slug: null,
      metadata_json: JSON.stringify({ subject: subject || "" }),
      referrer: req.get("referer") || "",
      user_agent: req.get("user-agent") || "",
    });

    return res.status(201).json({
      success: true,
      message: "Gửi liên hệ thành công",
      data: {
        id: result.insertId,
        name,
        email,
        subject: subject || null,
        message,
      },
    });
  } catch (error) {
    next(error);
  }
};

const getAllMessages = async (_req, res, next) => {
  try {
    const messages = await messageModel.getAllMessages();
    const unreadCount = await messageModel.getUnreadCount();

    return res.status(200).json({
      success: true,
      message: "Lấy danh sách liên hệ thành công",
      data: messages,
      meta: {
        unread_count: unreadCount,
      },
    });
  } catch (error) {
    next(error);
  }
};

const updateMessageReadState = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { is_read } = req.body;

    const existingMessage = await messageModel.getMessageById(id);
    if (!existingMessage) {
      throw createHttpError(404, "Không tìm thấy message để cập nhật");
    }

    await messageModel.updateMessageReadState(id, Boolean(is_read));
    const updatedMessage = await messageModel.getMessageById(id);

    return res.status(200).json({
      success: true,
      message: Boolean(is_read) ? "Đã đánh dấu đã đọc" : "Đã đánh dấu chưa đọc",
      data: updatedMessage,
    });
  } catch (error) {
    next(error);
  }
};

const deleteMessage = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await messageModel.deleteMessageById(id);

    if (result.affectedRows === 0) {
      throw createHttpError(404, "Không tìm thấy message để xóa");
    }

    return res.status(200).json({
      success: true,
      message: "Xóa message thành công",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createMessage,
  getAllMessages,
  updateMessageReadState,
  deleteMessage,
};
