import { Request, Response } from "express";

import { getDashboardStats } from "../services/dashboard.service.js";

export const getDashboard = async (
_req: Request,
res: Response,
) => {
try {
const dashboard =
await getDashboardStats();

return res.status(200).json({
  success: true,
  data: dashboard,
});

} catch (error) {
console.error(
"Dashboard error:",
error,
);

return res.status(500).json({
  success: false,
  message:
    "Failed to load dashboard data",
});

}
};