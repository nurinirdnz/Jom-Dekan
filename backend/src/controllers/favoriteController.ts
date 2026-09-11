import type { Request, Response, NextFunction } from "express";
import { favoriteService } from "../services/favoriteService";
import type { FavoriteTargetType } from "../models/favoriteModel";

function ctxFrom(req: Request) {
  return {
    actorUserId: req.user!.id,
    actorRole: req.user!.role,
    requestId: req.requestId,
    ipAddress: req.ip,
  };
}

export const favoriteController = {
  async add(req: Request, res: Response, next: NextFunction) {
    try {
      const { targetType, targetId } = req.body as {
        targetType: FavoriteTargetType;
        targetId: string;
      };
      const data = await favoriteService.add(targetType, targetId, ctxFrom(req));
      res.status(200).json({ message: "Added to favorites.", data });
    } catch (err) {
      next(err);
    }
  },

  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      const { targetType, targetId } = req.params as {
        targetType: FavoriteTargetType;
        targetId: string;
      };
      await favoriteService.remove(targetType, targetId, ctxFrom(req));
      res.status(200).json({ message: "Removed from favorites." });
    } catch (err) {
      next(err);
    }
  },

  async checkStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { targetType, targetId } = req.params as {
        targetType: FavoriteTargetType;
        targetId: string;
      };
      const data = await favoriteService.isFavorited(targetType, targetId, ctxFrom(req));
      res.status(200).json({ data });
    } catch (err) {
      next(err);
    }
  },

  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const { data, meta } = await favoriteService.list(
        req.query as unknown as Parameters<typeof favoriteService.list>[0],
        ctxFrom(req),
      );
      res.status(200).json({ data, meta });
    } catch (err) {
      next(err);
    }
  },
};
