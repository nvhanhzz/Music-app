import express, { Router } from "express";
import * as validate from "../../validate/client/user.validate";
import * as controller from "../../controllers/client/user.controller";
import { isLoggedIn } from "../../middlewares/auth";

const router: Router = express.Router();

router.get("/register", controller.getRegister);

router.post("/register", validate.validatePostRegister, controller.postRegister);

router.get("/login", controller.getLogin);

router.post("/login", controller.postLogin);

router.post("/logout", controller.postLogout);

router.patch("/addFavoriteSong", isLoggedIn, validate.addFavoriteSong, controller.addFavoriteSong);

export default router;