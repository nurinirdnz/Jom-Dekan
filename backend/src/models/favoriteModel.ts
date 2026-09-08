import { pool } from "../config/config/db";
import { toApiResourceListItem, type ResourceListRow } from "./resourceModel";

export interface FavoriteRow {
  id: string;
  user_id: string;
  resource_id: string;
  created_at: Date;
}

export interface FavoriteListRow extends ResourceListRow {
  favorite_id: string;
  favorited_at: Date;
}

/**
 * Parameterized SQL only, no Express req/res — same rule as
 * resourceModel/taxonomyModel. Uniqueness is enforced by the
 * favorites_user_id_resource_id_key DB constraint (migration 005), not
 * checked here — create() is allowed to throw a Postgres 23505 error,
 * which the service layer catches.
 */
export const favoriteModel = {
  async create(userId: string, resourceId: string): Promise<FavoriteRow> {
    const result = await pool.query<FavoriteRow>(
      `INSERT INTO favorites (user_id, resource_id)
       VALUES ($1, $2)
       RETURNING *`,
      [userId, resourceId],
    );
    return result.rows[0];
  },

  async findByUserAndResource(
    userId: string,
    resourceId: string,
  ): Promise<FavoriteRow | null> {
    const result = await pool.query<FavoriteRow>(
      `SELECT * FROM favorites WHERE user_id = $1 AND resource_id = $2`,
      [userId, resourceId],
    );
    return result.rows[0] ?? null;
  },

  async remove(userId: string, resourceId: string): Promise<boolean> {
    const result = await pool.query(
      `DELETE FROM favorites WHERE user_id = $1 AND resource_id = $2`,
      [userId, resourceId],
    );
    return (result.rowCount ?? 0) > 0;
  },

  async list(params: {
    userId: string;
    limit: number;
    offset: number;
  }): Promise<{ rows: FavoriteListRow[]; total: number }> {
    const countResult = await pool.query<{ count: string }>(
      `SELECT COUNT(*) FROM favorites WHERE user_id = $1`,
      [params.userId],
    );

    const rowsResult = await pool.query<FavoriteListRow>(
      `SELECT f.id AS favorite_id, f.created_at AS favorited_at, r.*,
              rf.id AS ready_file_id, rf.detected_mime_type AS ready_file_mime_type
       FROM favorites f
       JOIN resources r ON r.id = f.resource_id
       LEFT JOIN LATERAL (
         SELECT id, detected_mime_type FROM resource_files
         WHERE resource_id = r.id AND status = 'READY'
         ORDER BY created_at ASC
         LIMIT 1
       ) rf ON true
       WHERE f.user_id = $1
       ORDER BY f.created_at DESC
       LIMIT $2 OFFSET $3`,
      [params.userId, params.limit, params.offset],
    );

    return { rows: rowsResult.rows, total: Number(countResult.rows[0].count) };
  },
};

export function toApiFavorite(row: FavoriteRow) {
  return {
    id: row.id,
    userId: row.user_id,
    resourceId: row.resource_id,
    createdAt: row.created_at,
  };
}

export function toApiFavoriteListItem(row: FavoriteListRow) {
  return {
    favoriteId: row.favorite_id,
    favoritedAt: row.favorited_at,
    resource: toApiResourceListItem(row),
  };
}
