
import { Request, Response } from "express";
import {
  getAdminCustomers,
  getAdminCustomerById,
} from "../services/admin-customer.service.js";

export const getAdminCustomersController = async (
  req: Request,
  res: Response,
) => {
  try {
    const search =
      typeof req.query.search === "string"
        ? req.query.search
        : undefined;

    const page = Number(req.query.page ?? 1);
    const limit = Number(req.query.limit ?? 20);

    const result = await getAdminCustomers({
      search,
      page,
      limit,
    });

    return res.status(200).json({
      success: true,
      data: result.customers,
      pagination: result.pagination,
    });
  } catch (error) {
    console.error("Get admin customers error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch customers",
    });
  }
};

export const getAdminCustomerByIdController = async (
  req: Request,
  res: Response,
) => {
  try {
    const id = Array.isArray(req.params.id)
      ? req.params.id[0]
      : req.params.id;

    const customer = await getAdminCustomerById(id);

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: customer,
    });
  } catch (error) {
    console.error("Get admin customer error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch customer details",
    });
  }
};
