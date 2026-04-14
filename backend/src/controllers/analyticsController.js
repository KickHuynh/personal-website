const analyticsModel = require("../models/analyticsModel");
const { createHttpError } = require("../utils/httpErrors");

const ALLOWED_EVENTS = new Set([
  "page_view",
  "project_view",
  "project_click",
  "contact_submit",
]);

const trackEvent = async (req, res, next) => {
  try {
    const { event_type, page_path, project_slug, metadata } = req.body;

    if (!ALLOWED_EVENTS.has(event_type)) {
      throw createHttpError(400, "Analytics event không hợp lệ");
    }

    await analyticsModel.createEvent({
      event_type,
      page_path,
      project_slug,
      metadata_json: metadata ? JSON.stringify(metadata) : null,
      referrer: req.get("referer") || "",
      user_agent: req.get("user-agent") || "",
    });

    return res.status(201).json({
      success: true,
      message: "Đã ghi nhận analytics event",
    });
  } catch (error) {
    next(error);
  }
};

const getAnalyticsOverview = async (_req, res, next) => {
  try {
    const summary = await analyticsModel.getOverview();

    return res.status(200).json({
      success: true,
      message: "Lấy tổng quan analytics thành công",
      data: summary,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAnalyticsOverview,
  trackEvent,
};
