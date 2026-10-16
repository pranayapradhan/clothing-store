import { api } from "../../services/api";
import type {
  AuthResponse,
  AuthUser,
  LoginPayload,
  RegisterPayload,
} from "./auth.types";

export const authService = {
  async register(
    payload: RegisterPayload
  ): Promise<AuthUser> {
    const response =
      await api.post<AuthResponse>(
        "/auth/register",
        payload
      );

    return response.data.data.user;
  },

  async login(
    payload: LoginPayload
  ): Promise<AuthUser> {
    const response =
      await api.post<AuthResponse>(
        "/auth/login",
        payload
      );

    return response.data.data.user;
  },

  async logout(): Promise<void> {
    await api.post("/auth/logout");
  },

  async getMe(): Promise<AuthUser> {
    const response =
      await api.get<AuthResponse>(
        "/auth/me"
      );

    return response.data.data.user;
  },

  async refresh(): Promise<AuthUser> {
    const response =
      await api.post<AuthResponse>(
        "/auth/refresh"
      );

    return response.data.data.user;
  },
};