import { pool } from "../config/config/db";

export class OpportunityModel {
  static async getAllActive() {
    const query = `
            SELECT o.*, up.display_name as owner_name, s.code as subject_code, s.name as subject_name
            FROM opportunities o
            LEFT JOIN user_profiles up ON o.owner_id = up.user_id
            LEFT JOIN subjects s ON o.subject_id = s.id
            WHERE o.status = 'active'
            ORDER BY o.created_at DESC
        `;

    const result = await pool.query(query);
    return result.rows;
  }

  static async create(
    ownerId: string,
    data: {
      title: string;
      description: string;
      subjectId?: string;
      listingType: string;
      mode: string;
    },
  ) {
    const query = `
            INSERT INTO opportunities (owner_id, title, description, subject_id, listing_type, mode, status)
            VALUES ($1, $2, $3, $4, $5, $6, 'active')
            RETURNING *
        `;
    const values = [
      ownerId,
      data.title,
      data.description,
      data.subjectId || null,
      data.listingType,
      data.mode,
    ];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async createApplication(
    opportunityId: string,
    applicantId: string,
    coverMessage: string,
  ) {
    const query = `
            INSERT INTO opportunity_applications (opportunity_id, applicant_id, cover_message, status)
            VALUES ($1, $2, $3, 'pending')
            RETURNING *
        `;
    const values = [opportunityId, applicantId, coverMessage];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async getAllForAdmin() {
    const query = `
            SELECT o.*, up.display_name as owner_name, s.code as subject_code, s.name as subject_name
            FROM opportunities o
            LEFT JOIN user_profiles up ON o.owner_id = up.user_id
            LEFT JOIN subjects s ON o.subject_id = s.id
            ORDER BY o.created_at DESC
        `;
    const result = await pool.query(query);
    return result.rows;
  }

  static async updateStatus(id: string, status: string) {
    const query = `
            UPDATE opportunities SET status = $1 WHERE id = $2
            RETURNING *
        `;
    const result = await pool.query(query, [status, id]);
    return result.rows[0];
  }
}
