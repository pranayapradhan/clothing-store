import { api } from "../../services/api";
import type { DashboardResponse } from "./dashboard.types";

export const getDashboard =
async (): Promise<DashboardResponse> => {
const response =
await api.get<DashboardResponse>(
"/admin/dashboard",
);

return response.data;

};