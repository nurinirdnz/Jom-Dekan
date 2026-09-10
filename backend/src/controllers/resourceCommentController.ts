import type { Request, Response, NextFunction } from "express";
import { resourceCommentService } from "../services/resourceCommentService";

function ctxFrom(req: Request) {
  return {
    actorUserId: req.user!.id,
    actorRole: req.user!.role,
    requestId: req.requestId,
    ipAddress: req.ip,
  };
}

export const resourceCommentController = {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await resourceCommentService.list(
        req.params.resourceId,
        ctxFrom(req),
      );
      res.status(200).json({ data });
    } catch (err) {
      next(err);
    }
  },
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await resourceCommentService.create(
        req.params.resourceId,
        req.body.body,
        ctxFrom(req),
      );
      res.status(201).json({ message: "Comment added.", data });
    } catch (err) {
      next(err);
    }
  },
  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await resourceCommentService.update(
        req.params.commentId,
        req.body.body,
        ctxFrom(req),
      );
      res.status(200).json({ message: "Comment updated.", data });
    } catch (err) {
      next(err);
    }
  },
  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      await resourceCommentService.remove(req.params.commentId, ctxFrom(req));
      res.status(200).json({ message: "Comment deleted." });
    } catch (err) {
      next(err);
    }
  },
};
