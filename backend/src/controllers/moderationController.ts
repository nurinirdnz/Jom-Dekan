import { Request, Response, NextFunction } from "express";
import { ModerationModel } from "../models/moderationModel";

export class ModerationService {
  static async getNotifications(userId: string) {
    return await ModerationModel.getNotificationsForUser(userId);
  }

  static async markRead(id: string, userId: string) {
    return await ModerationModel.markNotificationRead(id, userId);
  }

  static async getQueue() {
    return await ModerationModel.getModerationQueue();
  }

  static async handleAction(
    targetType: string,
    id: string,
    action: string,
    adminId: string,
    reason: string,
  ) {
    if (targetType === "resource") {
      const statusMap: Record<string, string> = {
        approve: "approved",
        reject: "rejected",
        quarantine: "quarantined",
      };
      return await ModerationModel.updateResourceModeration(
        id,
        statusMap[action],
        adminId,
        reason,
      );
    }
    throw new Error("Unsupported moderation target type");
  }
}

export const getNotifications = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user!.id;
    const data = await ModerationService.getNotifications(userId);
    return res.json({ data });
  } catch (error) {
    return next(error);
  }
};

export const markNotificationRead = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;
    const data = await ModerationService.markRead(id, userId);
    if (!data)
      return res
        .status(404)
        .json({
          error: { code: "NOT_FOUND", message: "Notification not found." },
        });
    return res.json({ message: "Notification marked as read", data });
  } catch (error) {
    return next(error);
  }
};

export const getModerationQueue = async (
  _req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const data = await ModerationService.getQueue();
    return res.json({ data });
  } catch (error) {
    return next(error);
  }
};

export const handleModerationAction = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const adminId = req.user!.id;
    const { targetType, id } = req.params;
    const { action, reason } = req.body;

    const data = await ModerationService.handleAction(
      targetType,
      id,
      action,
      adminId,
      reason,
    );
    return res.json({
      message: "Moderation action recorded successfully",
      data,
    });
  } catch (error) {
    return next(error);
  }
};
