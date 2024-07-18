import express, { Router } from "express";
import * as controller from "../../controllers/admin/auth.controller";
import * as validate from "../../validate/admin/admin.validate";
import { isLoggedIn, isLoggedOut } from "../../middlewares/admin/auth";

const router: Router = express.Router();

router.get("/login", isLoggedOut, controller.getLogin);

router.post("/login", isLoggedOut, validate.login, controller.postLogin);

router.post("/logout", isLoggedIn, controller.postLogout);

export default router;