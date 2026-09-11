import type { Request, Response, NextFunction } from "express";
import { reportService } from "../services/reportService";

function ctxFrom(req: Request) {
  return {
    actorUserId: req.user!.id,
    actorRole: req.user!.role,
    requestId: req.requestId,
    ipAddress: req.ip,
  };
}

export const reportController = {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await reportService.create(req.body, ctxFrom(req));
      res.status(201).json({ message: "Report submitted.", data });
    } catch (err) {
      next(err);
    }
  },
};
