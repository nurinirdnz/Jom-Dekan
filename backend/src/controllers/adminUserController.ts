import type { Request, Response, NextFunction } from "express";
import { adminUserService } from "../services/adminUserService";

export const adminUserController = {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const { data, meta } = await adminUserService.list(
        req.query as unknown as Parameters<typeof adminUserService.list>[0],
      );
      res.status(200).json({ data, meta });
    } catch (err) {
      next(err);
    }
  },

  async getProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params as { id: string };
      const data = await adminUserService.getProfile(id);
      res.status(200).json({ data });
    } catch (err) {
      next(err);
    }
  },

  async getResources(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params as { id: string };
      const { data, meta } = await adminUserService.getResources(
        id,
        req.query as unknown as { page: number; pageSize: number },
      );
      res.status(200).json({ data, meta });
    } catch (err) {
      next(err);
    }
  },

  async getForumActivity(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params as { id: string };
      const { data, meta } = await adminUserService.getForumActivity(
        id,
        req.query as unknown as { page: number; pageSize: number },
      );
      res.status(200).json({ data, meta });
    } catch (err) {
      next(err);
    }
  },

  async getApplications(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params as { id: string };
      const { data, meta } = await adminUserService.getApplications(
        id,
        req.query as unknown as { page: number; pageSize: number },
      );
      res.status(200).json({ data, meta });
    } catch (err) {
      next(err);
    }
  },
};
