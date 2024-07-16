import express, { Router } from "express";
import * as controller from "../../controllers/admin/song.controller";

const router: Router = express.Router();

router.get("/", controller.index);

export default router;