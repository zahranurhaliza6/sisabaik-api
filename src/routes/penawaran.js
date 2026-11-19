
import { Router } from "express";
import * as controller from "../controllers/penawaran.js";
import { wajibLogin } from "../middleware/auth.js";

const router = Router();

router.get("/", controller.daftar);
router.get("/milik-saya", wajibLogin, controller.milikSaya);
router.get("/:id", controller.detail);
router.post("/", wajibLogin, controller.buat);
router.put("/:id", wajibLogin, controller.ubah);
router.delete("/:id", wajibLogin, controller.hapus);

export default router;
