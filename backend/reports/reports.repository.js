const pool = require("../db");

/**
 * Get pipeline summary for the authenticated owner.
 */
async function getPipelineSummary(ownerId, days = 30) {
  const result = await pool.query(
    `
      SELECT 
        COUNT(*)::int AS total_deals,

        COALESCE(
          SUM(
            CASE
              WHEN d.stage <> 'lost'
              THEN d.amount
              ELSE 0
            END
          ),
          0
        )::numeric AS total_pipeline_value,

        COUNT(*) FILTER (
          WHERE d.stage NOT IN ('won', 'lost')
        )::int AS open_deals,

        COUNT(*) FILTER (
          WHERE d.stage = 'won'
        )::int AS won_deals,

        COUNT(*) FILTER (
          WHERE d.stage = 'lost'
        )::int AS lost_deals

      FROM deals d
      WHERE d.owner_id = $1
        AND d.created_at >= CURRENT_TIMESTAMP - ($2 * INTERVAL '1 day')
    `,
    [ownerId, days]
  );

  const stagesResult = await pool.query(
    `
      SELECT
        d.stage,
        COUNT(*)::int AS count,
        COALESCE(SUM(d.amount), 0)::numeric AS value
      FROM deals d
      WHERE d.owner_id = $1
        AND d.created_at >= CURRENT_TIMESTAMP - ($2 * INTERVAL '1 day')
      GROUP BY d.stage
      ORDER BY d.stage
    `,
    [ownerId, days]
  );

  return {
    summary: result.rows[0],
    stages: stagesResult.rows,
  };
}

/**
 * Get performance data for the authenticated owner.
 */
async function getPerformanceData(ownerId, days = 30) {
  const result = await pool.query(
    `
      SELECT
        TO_CHAR(
          DATE_TRUNC('day', d.created_at),
          'DD Mon'
        ) AS month,

        COUNT(*)::int AS deals,

        COUNT(*) FILTER (
          WHERE d.stage = 'won'
        )::int AS won_deals,

        COALESCE(
          SUM(
            CASE
              WHEN d.stage = 'won'
              THEN d.amount
              ELSE 0
            END
          ),
          0
        )::numeric AS revenue

      FROM deals d

      WHERE d.owner_id = $1
        AND d.created_at >=
          CURRENT_TIMESTAMP - ($2 * INTERVAL '1 day')

      GROUP BY DATE_TRUNC('day', d.created_at)

      ORDER BY DATE_TRUNC('day', d.created_at)
    `,
    [ownerId, days]
  );

  return result.rows;
}

/**
 * Count contacts belonging to the authenticated owner.
 */
async function getLeadCount(ownerId, days = 30) {
  const result = await pool.query(
    `
      SELECT COUNT(*)::int AS total_leads
      FROM contacts
      WHERE owner_id = $1
        AND created_at >=
          CURRENT_TIMESTAMP - ($2 * INTERVAL '1 day')
    `,
    [ownerId, days]
  );

  return result.rows[0].total_leads;
}

module.exports = {
  getPipelineSummary,
  getPerformanceData,
  getLeadCount,
};