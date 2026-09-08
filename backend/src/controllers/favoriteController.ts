import type { Request, Response, NextFunction } from "express";
import { favoriteService } from "../services/favoriteService";

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
      const { resourceId } = req.body as { resourceId: string };
      const data = await favoriteService.add(resourceId, ctxFrom(req));
      res.status(200).json({ message: "Added to favorites.", data });
    } catch (err) {
      next(err);
    }
  },

  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      const { resourceId } = req.params as { resourceId: string };
      await favoriteService.remove(resourceId, ctxFrom(req));
      res.status(200).json({ message: "Removed from favorites." });
    } catch (err) {
      next(err);
    }
  },

  async checkStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { resourceId } = req.params as { resourceId: string };
      const data = await favoriteService.isFavorited(resourceId, ctxFrom(req));
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
