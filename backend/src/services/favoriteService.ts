import {
  favoriteModel,
  toApiFavorite,
  toApiFavoriteListItem,
} from "../models/favoriteModel";
import { resourceService } from "./resourceService";
import { auditLogModel } from "../models/auditLogModel";

interface ActorContext {
  actorUserId: string;
  actorRole: "USER" | "ADMIN";
  requestId?: string;
  ipAddress?: string;
}

function isUniqueViolation(err: unknown): boolean {
  return (
    typeof err === "object" &&
    err !== null &&
    (err as { code?: string }).code === "23505"
  );
}

export const favoriteService = {
  async add(resourceId: string, ctx: ActorContext) {
    // Reuses resourceService's own visibility gate — a user can't
    // favorite a resource they can't see (404s the same way viewing it
    // would), so this never leaks whether a hidden resource exists.
    await resourceService.getById(resourceId, ctx);

    let row;
    try {
      row = await favoriteModel.create(ctx.actorUserId, resourceId);
    } catch (err) {
      if (isUniqueViolation(err)) {
        // Already favorited — a double-click or replayed request hit
        // the DB constraint from migration 005. Treat it as success,
        // not an error: the end state the caller wanted ("this is
        // favorited") is already true.
        const existing = await favoriteModel.findByUserAndResource(
          ctx.actorUserId,
          resourceId,
        );
        return toApiFavorite(existing!);
      }
      throw err;
    }

    await auditLogModel.record({
      actorUserId: ctx.actorUserId,
      action: "FAVORITE_ADDED",
      targetType: "resource",
      targetId: resourceId,
      requestId: ctx.requestId,
      ipAddress: ctx.ipAddress,
    });

    return toApiFavorite(row);
  },

  async remove(resourceId: string, ctx: ActorContext) {
    const removed = await favoriteModel.remove(ctx.actorUserId, resourceId);
    if (removed) {
      await auditLogModel.record({
        actorUserId: ctx.actorUserId,
        action: "FAVORITE_REMOVED",
        targetType: "resource",
        targetId: resourceId,
        requestId: ctx.requestId,
        ipAddress: ctx.ipAddress,
      });
    }
    // Idempotent either way — removing a favorite that doesn't exist is
    // not an error, it's just already the desired state.
  },

  async isFavorited(resourceId: string, ctx: ActorContext) {
    const existing = await favoriteModel.findByUserAndResource(
      ctx.actorUserId,
      resourceId,
    );
    return { isFavorited: existing !== null };
  },

  async list(filters: { page: number; pageSize: number }, ctx: ActorContext) {
    const limit = filters.pageSize;
    const offset = (filters.page - 1) * filters.pageSize;

    const { rows, total } = await favoriteModel.list({
      userId: ctx.actorUserId,
      limit,
      offset,
    });

    return {
      data: rows.map(toApiFavoriteListItem),
      meta: { page: filters.page, pageSize: filters.pageSize, total },
    };
  },
};
