import { AppError } from "../types/errors";
import {
  adminUserModel,
  toApiAdminUserListItem,
  toApiAdminUserProfile,
  toApiAdminUserResource,
  toApiAdminUserForumActivity,
  toApiAdminUserApplication,
} from "../models/adminUserModel";

function paginate(filters: { page: number; pageSize: number }) {
  return {
    limit: filters.pageSize,
    offset: (filters.page - 1) * filters.pageSize,
  };
}

export const adminUserService = {
  async list(filters: { search?: string; page: number; pageSize: number }) {
    const { limit, offset } = paginate(filters);
    const { rows, total } = await adminUserModel.listWithStats({
      search: filters.search,
      limit,
      offset,
    });
    return {
      data: rows.map(toApiAdminUserListItem),
      meta: { page: filters.page, pageSize: filters.pageSize, total },
    };
  },

  async getProfile(userId: string) {
    const row = await adminUserModel.getProfile(userId);
    if (!row) throw AppError.notFound("User not found.");
    return toApiAdminUserProfile(row);
  },

  async getResources(
    userId: string,
    filters: { page: number; pageSize: number },
  ) {
    const { limit, offset } = paginate(filters);
    const { rows, total } = await adminUserModel.listResourcesByOwner(
      userId,
      limit,
      offset,
    );
    return {
      data: rows.map(toApiAdminUserResource),
      meta: { page: filters.page, pageSize: filters.pageSize, total },
    };
  },

  async getForumActivity(
    userId: string,
    filters: { page: number; pageSize: number },
  ) {
    const { limit, offset } = paginate(filters);
    const { rows, total } = await adminUserModel.listForumActivityByAuthor(
      userId,
      limit,
      offset,
    );
    return {
      data: rows.map(toApiAdminUserForumActivity),
      meta: { page: filters.page, pageSize: filters.pageSize, total },
    };
  },

  async getApplications(
    userId: string,
    filters: { page: number; pageSize: number },
  ) {
    const { limit, offset } = paginate(filters);
    const { rows, total } = await adminUserModel.listApplicationsByApplicant(
      userId,
      limit,
      offset,
    );
    return {
      data: rows.map(toApiAdminUserApplication),
      meta: { page: filters.page, pageSize: filters.pageSize, total },
    };
  },
};
