import { pool } from "../config/config/db";

export interface ResourceCommentRow {
  id: string;
  resource_id: string;
  author_id: string;
  author_name: string;
  body: string;
  deleted_at: Date | null;
  created_at: Date;
  updated_at: Date;
}

export const resourceCommentModel = {
  async create(
    resourceId: string,
    authorId: string,
    body: string,
  ): Promise<ResourceCommentRow> {
    const result = await pool.query<ResourceCommentRow>(
      `INSERT INTO resource_comments (resource_id, author_id, body)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [resourceId, authorId, body],
    );
    return (await this.findById(result.rows[0].id))!;
  },

  async findById(id: string): Promise<ResourceCommentRow | null> {
    const result = await pool.query<ResourceCommentRow>(
      `SELECT c.id, c.resource_id, c.author_id,
         COALESCE(p.display_name, 'Student') AS author_name,
         c.body, c.deleted_at, c.created_at, c.updated_at
       FROM resource_comments c
       LEFT JOIN user_profiles p ON p.user_id = c.author_id
       WHERE c.id = $1`,
      [id],
    );
    return result.rows[0] ?? null;
  },

  async listByResource(resourceId: string): Promise<ResourceCommentRow[]> {
    const result = await pool.query<ResourceCommentRow>(
      `SELECT c.id, c.resource_id, c.author_id,
         COALESCE(p.display_name, 'Student') AS author_name,
         c.body, c.deleted_at, c.created_at, c.updated_at
       FROM resource_comments c
       LEFT JOIN user_profiles p ON p.user_id = c.author_id
       WHERE c.resource_id = $1 AND c.deleted_at IS NULL
       ORDER BY c.created_at ASC`,
      [resourceId],
    );
    return result.rows;
  },

  async update(id: string, body: string): Promise<ResourceCommentRow | null> {
    const result = await pool.query<ResourceCommentRow>(
      `UPDATE resource_comments SET body = $2, updated_at = now()
       WHERE id = $1 AND deleted_at IS NULL
       RETURNING *`,
      [id, body],
    );
    return result.rows[0] ? this.findById(id) : null;
  },

  async softDelete(id: string): Promise<boolean> {
    const result = await pool.query(
      `UPDATE resource_comments SET deleted_at = now()
       WHERE id = $1 AND deleted_at IS NULL`,
      [id],
    );
    return (result.rowCount ?? 0) > 0;
  },
};

export function toApiResourceComment(row: ResourceCommentRow) {
  return {
    id: row.id,
    resourceId: row.resource_id,
    authorId: row.author_id,
    authorName: row.author_name,
    body: row.body,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
