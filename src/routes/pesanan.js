
import { Router } from "express";
import * as controller from "../controllers/pesanan.js";
import { wajibLogin } from "../middleware/auth.js";

const router = Router();

router.use(wajibLogin);

router.get("/", controller.daftar);
router.get("/:id", controller.detail);
router.post("/", controller.buat);

export default router;
