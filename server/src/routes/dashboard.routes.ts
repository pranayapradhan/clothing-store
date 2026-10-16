import { Router } from "express";

import {
authenticate,
} from "../middleware/authenticate.js";

import {
authorize,
} from "../middleware/authorize.js";

import {
getDashboard,
} from "../controllers/dashboard.controller.js";

const router = Router();

router.get(
"/",
authenticate,
authorize("ADMIN"),
getDashboard,
);

export default router;