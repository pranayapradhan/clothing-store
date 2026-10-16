import { Router } from "express";
import upload from "../middleware/upload.js";
import { authenticate } from "../middleware/authenticate.js";
import { authorize } from "../middleware/authorize.js";
import {
  upload as uploadImage,
  remove as removeImage,
} from "../controllers/image.controller.js";

const router = Router();

router.use(authenticate, authorize("ADMIN"));

router.post("/product", upload.single("image"), uploadImage);

router.delete("/product", removeImage);

export default router;
