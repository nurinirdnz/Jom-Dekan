import { useQuery } from "@tanstack/react-query";
import { adminUserService } from "../service/adminUserService";

export function useAdminUsersList(params: {
  search?: string;
  page?: number;
  pageSize?: number;
}) {
  return useQuery({
    queryKey: ["admin", "users", "list", params],
    queryFn: () => adminUserService.list(params),
  });
}

export function useAdminUserProfile(userId: string | undefined) {
  return useQuery({
    queryKey: ["admin", "users", "profile", userId],
    queryFn: () => adminUserService.getProfile(userId!),
    enabled: Boolean(userId),
  });
}

export function useAdminUserResources(
  userId: string | undefined,
  params: { page?: number; pageSize?: number },
) {
  return useQuery({
    queryKey: ["admin", "users", "resources", userId, params],
    queryFn: () => adminUserService.getResources(userId!, params),
    enabled: Boolean(userId),
  });
}

export function useAdminUserForumActivity(
  userId: string | undefined,
  params: { page?: number; pageSize?: number },
) {
  return useQuery({
    queryKey: ["admin", "users", "forum", userId, params],
    queryFn: () => adminUserService.getForumActivity(userId!, params),
    enabled: Boolean(userId),
  });
}

export function useAdminUserApplications(
  userId: string | undefined,
  params: { page?: number; pageSize?: number },
) {
  return useQuery({
    queryKey: ["admin", "users", "applications", userId, params],
    queryFn: () => adminUserService.getApplications(userId!, params),
    enabled: Boolean(userId),
  });
}
