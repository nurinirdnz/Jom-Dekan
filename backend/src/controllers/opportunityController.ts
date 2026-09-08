import { Request, Response, NextFunction } from "express";
import { OpportunityModel } from "../models/opportunityModel";

export class OpportunityService {
  static async getOpportunities() {
    return await OpportunityModel.getAllActive();
  }

  static async createOpportunity(ownerId: string, data: any) {
    return await OpportunityModel.create(ownerId, data);
  }

  static async apply(
    opportunityId: string,
    applicantId: string,
    coverMessage: string,
  ) {
    return await OpportunityModel.createApplication(
      opportunityId,
      applicantId,
      coverMessage,
    );
  }

  static async getAllForAdmin() {
    return await OpportunityModel.getAllForAdmin();
  }

  static async updateStatus(id: string, status: string) {
    return await OpportunityModel.updateStatus(id, status);
  }
}

export const getOpportunities = async (
  _req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const data = await OpportunityService.getOpportunities();
    return res.json({ data });
  } catch (error) {
    return next(error);
  }
};

export const createOpportunity = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const ownerId = req.user!.id;
    const data = await OpportunityService.createOpportunity(ownerId, req.body);
    return res
      .status(201)
      .json({ message: "Opportunity created successfully", data });
  } catch (error) {
    return next(error);
  }
};

export const applyToOpportunity = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const applicantId = req.user!.id;
    const { id } = req.params;
    const { coverMessage } = req.body;

    const data = await OpportunityService.apply(id, applicantId, coverMessage);
    return res
      .status(201)
      .json({ message: "Application submitted successfully", data });
  } catch (error: any) {
    if (error.code === "23505") {
      return res.status(409).json({
        error: {
          code: "DUPLICATE_APPLICATION",
          message: "You have already applied to this opportunity.",
        },
      });
    }
    return next(error);
  }
};

export const getAllOpportunitiesForAdmin = async (
  _req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const data = await OpportunityService.getAllForAdmin();
    return res.json({ data });
  } catch (error) {
    return next(error);
  }
};

export const updateOpportunityStatus = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const data = await OpportunityService.updateStatus(id, status);
    if (!data) {
      return res
        .status(404)
        .json({ error: { code: "NOT_FOUND", message: "Opportunity not found." } });
    }
    return res.json({ message: "Opportunity status updated", data });
  } catch (error) {
    return next(error);
  }
};

/**
 * @openapi
 * /api/v1/opportunities:
 *   get:
 *, summary: Get all active marketplace opportunities
 *     tags: [Opportunities]
 *     responses:
 *       200:
 *         description: List of active opportunities
 */
