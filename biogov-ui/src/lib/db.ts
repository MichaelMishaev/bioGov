/**
 * Database Client Utility for Neon PostgreSQL
 * Provides connection pooling and query helpers for bioGov MVP
 */

import { Pool, QueryResult, QueryResultRow } from 'pg';

// Connection pool configuration
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, // Required for Neon
  },
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
  connectionTimeoutMillis: 2000, // Return an error after 2 seconds if connection cannot be established
});

// Handle pool errors
pool.on('error', (err) => {
  console.error('Unexpected error on idle database client', err);
  process.exit(-1);
});

/**
 * Execute a query with parameters
 * @param text SQL query string
 * @param params Query parameters (optional)
 * @returns Query result
 */
export async function query<T extends QueryResultRow = any>(
  text: string,
  params?: any[]
): Promise<QueryResult<T>> {
  const start = Date.now();

  try {
    const result = await pool.query<T>(text, params);
    const duration = Date.now() - start;

    // Log slow queries (> 1 second)
    if (duration > 1000) {
      console.warn(`Slow query (${duration}ms):`, text.substring(0, 100));
    }

    return result;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

/**
 * Get a client from the pool for transactions
 * Remember to call client.release() when done!
 */
export async function getClient() {
  return await pool.connect();
}

/**
 * Close the database pool (for graceful shutdown)
 */
export async function closePool() {
  await pool.end();
}

/**
 * Database helper functions for common operations
 */
export const db = {
  /**
   * Insert a user and return the created record
   */
  async createUser(email: string, name: string, consentGiven: boolean = false) {
    const result = await query<{
      id: string;
      email: string;
      name: string;
      created_at: Date;
      consent_given: boolean;
    }>(
      `INSERT INTO public.users (email, name, consent_given)
       VALUES ($1, $2, $3)
       RETURNING id, email, name, created_at, consent_given`,
      [email, name, consentGiven]
    );
    return result.rows[0];
  },

  /**
   * Find user by email
   */
  async findUserByEmail(email: string) {
    const result = await query(
      `SELECT id, email, name, created_at, consent_given, unsubscribed_at
       FROM public.users
       WHERE email = $1`,
      [email]
    );
    return result.rows[0] || null;
  },

  /**
   * Create an assessment record
   */
  async createAssessment(data: {
    userId?: string;
    answersJson: object;
    resultStatus: 'פטור' | 'מורשה' | 'choice';
    resultChecklist: object;
    ipHash?: string;
    userAgent?: string;
  }) {
    const result = await query<{
      id: string;
      user_id: string | null;
      answers_json: object;
      result_status: string;
      result_checklist: object;
      created_at: Date;
    }>(
      `INSERT INTO public.assessments
       (user_id, answers_json, result_status, result_checklist, ip_hash, user_agent)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, user_id, answers_json, result_status, result_checklist, created_at`,
      [
        data.userId || null,
        JSON.stringify(data.answersJson),
        data.resultStatus,
        JSON.stringify(data.resultChecklist),
        data.ipHash || null,
        data.userAgent || null,
      ]
    );
    return result.rows[0];
  },

  /**
   * Get assessment by ID (for shareable results URL)
   */
  async getAssessmentById(id: string) {
    const result = await query(
      `SELECT
         a.id,
         a.user_id,
         a.answers_json,
         a.result_status,
         a.result_checklist,
         a.created_at,
         u.email,
         u.name
       FROM public.assessments a
       LEFT JOIN public.users u ON a.user_id = u.id
       WHERE a.id = $1`,
      [id]
    );
    return result.rows[0] || null;
  },

  /**
   * Create feedback entry
   */
  async createFeedback(data: {
    userId?: string;
    assessmentId: string;
    rating: number;
    comment?: string;
  }) {
    const result = await query<{
      id: string;
      assessment_id: string;
      rating: number;
      comment: string | null;
      created_at: Date;
    }>(
      `INSERT INTO public.feedback (user_id, assessment_id, rating, comment)
       VALUES ($1, $2, $3, $4)
       RETURNING id, assessment_id, rating, comment, created_at`,
      [data.userId || null, data.assessmentId, data.rating, data.comment || null]
    );
    return result.rows[0];
  },

  /**
   * Log email sent
   */
  async logEmail(data: {
    userId: string;
    emailType: 'results' | 'reminder' | 'welcome';
    sentAt?: Date;
  }) {
    const result = await query(
      `INSERT INTO public.email_logs (user_id, email_type, sent_at)
       VALUES ($1, $2, $3)
       RETURNING id`,
      [data.userId, data.emailType, data.sentAt || new Date()]
    );
    return result.rows[0];
  },

  /**
   * Get assessment statistics (from view)
   */
  async getAssessmentStats() {
    const result = await query(`SELECT * FROM public.assessment_stats`);
    return result.rows;
  },

  /**
   * Get feedback summary (from view)
   */
  async getFeedbackSummary() {
    const result = await query(`SELECT * FROM public.feedback_summary`);
    return result.rows[0] || null;
  },

  /**
   * Get daily signups (from view)
   */
  async getDailySignups(limit: number = 30) {
    const result = await query(
      `SELECT * FROM public.daily_signups LIMIT $1`,
      [limit]
    );
    return result.rows;
  },

  /**
   * Check rate limit by IP hash
   * Returns count of assessments from this IP in the last 24 hours
   */
  async checkRateLimit(ipHash: string): Promise<number> {
    const result = await query<{ count: string }>(
      `SELECT COUNT(*) as count
       FROM public.assessments
       WHERE ip_hash = $1
       AND created_at > NOW() - INTERVAL '24 hours'`,
      [ipHash]
    );
    return parseInt(result.rows[0].count, 10);
  },
};

// Export pool for advanced use cases
export { pool };
