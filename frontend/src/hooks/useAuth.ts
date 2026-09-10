import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { authService } from "../service/authService";
import { useAuthStore } from "../store/useAuthStore";
import type {
  ForgotPasswordFormValues,
  LoginFormValues,
  RegisterFormValues,
} from "../schemas/authSchemas";

export function useCurrentUser() {
  return useAuthStore((s) => s.user);
}

export function useLogin() {
  const setSession = useAuthStore((s) => s.setSession);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: LoginFormValues) => authService.login(values),
    onSuccess: (data) => {
      setSession(data.accessToken, data.user);
      queryClient.invalidateQueries();
      navigate("/dashboard");
    },
  });
}

export function useRegister() {
  const setSession = useAuthStore((s) => s.setSession);
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (values: RegisterFormValues) => authService.register(values),
    onSuccess: (data) => {
      setSession(data.accessToken, data.user);
      navigate("/dashboard");
    },
  });
}

export function useLogout() {
  const clearSession = useAuthStore((s) => s.clearSession);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => authService.logout(),
    onSettled: () => {
      clearSession();
      queryClient.clear();
      navigate("/login");
    },
  });
}

export function useForgotPassword() {
  return useMutation({
    mutationFn: (values: ForgotPasswordFormValues) =>
      authService.forgotPassword(values),
  });
}

export function useResetPassword() {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (values: { token: string; newPassword: string }) =>
      authService.resetPassword(values),
    onSuccess: () => {
      navigate("/login");
    },
  });
}
