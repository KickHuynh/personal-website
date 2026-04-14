const pool = require("../config/db");

const createEvent = async ({
  event_type,
  page_path,
  project_slug,
  metadata_json,
  referrer,
  user_agent,
}) => {
  const sql = `
    INSERT INTO analytics_events (
      event_type,
      page_path,
      project_slug,
      metadata_json,
      referrer,
      user_agent
    )
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  const [result] = await pool.query(sql, [
    event_type,
    page_path || null,
    project_slug || null,
    metadata_json || null,
    referrer || null,
    user_agent || null,
  ]);

  return result;
};

const getOverview = async () => {
  const [[totals]] = await pool.query(`
    SELECT
      COUNT(*) AS total_events,
      SUM(CASE WHEN event_type = 'page_view' THEN 1 ELSE 0 END) AS page_views,
      SUM(CASE WHEN event_type = 'project_view' THEN 1 ELSE 0 END) AS project_views,
      SUM(CASE WHEN event_type = 'project_click' THEN 1 ELSE 0 END) AS project_clicks,
      SUM(CASE WHEN event_type = 'contact_submit' THEN 1 ELSE 0 END) AS contact_submissions
    FROM analytics_events
  `);

  const [topProjects] = await pool.query(`
    SELECT project_slug, COUNT(*) AS views
    FROM analytics_events
    WHERE event_type = 'project_view' AND project_slug IS NOT NULL
    GROUP BY project_slug
    ORDER BY views DESC
    LIMIT 5
  `);

  const [recentEvents] = await pool.query(`
    SELECT id, event_type, page_path, project_slug, created_at
    FROM analytics_events
    ORDER BY created_at DESC
    LIMIT 10
  `);

  return {
    totals: {
      total_events: Number(totals.total_events) || 0,
      page_views: Number(totals.page_views) || 0,
      project_views: Number(totals.project_views) || 0,
      project_clicks: Number(totals.project_clicks) || 0,
      contact_submissions: Number(totals.contact_submissions) || 0,
    },
    top_projects: topProjects,
    recent_events: recentEvents,
  };
};

module.exports = {
  createEvent,
  getOverview,
};
