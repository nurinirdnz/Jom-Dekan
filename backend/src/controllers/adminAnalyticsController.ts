import type { Request, Response, NextFunction } from "express";
import { adminAnalyticsService } from "../services/adminAnalyticsService";

export const adminAnalyticsController = {
  async overview(_req: Request, res: Response, next: NextFunction) {
    try {
      const data = await adminAnalyticsService.getOverview();
      res.status(200).json({ data });
    } catch (err) {
      next(err);
    }
  },
};