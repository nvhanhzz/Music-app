import express, { Router } from "express";
import * as controller from "../../controllers/admin/myProfile.controller";

const router: Router = express.Router();

router.get(
    "/",
    controller.index
);

export default router;