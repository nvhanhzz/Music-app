import express, { Router } from "express";
import * as validate from "../../validate/client/user.validate";
import * as controller from "../../controllers/client/user.controller";
import { checkToken, isLoggedIn, isLoggedOut } from "../../middlewares/auth";

const router: Router = express.Router();

router.get("/register", controller.getRegister);

router.post("/register", validate.validatePostRegister, controller.postRegister);

router.get("/login", controller.getLogin);

router.post("/login", controller.postLogin);

router.post("/logout", controller.postLogout);

router.get("/password/forgot", isLoggedOut, controller.getForgotPassword);

router.post("/password/forgot", isLoggedOut, validate.forgotPassword, controller.postForgotPassword);

router.get("/password/verify-otp", isLoggedOut, checkToken({ tokenName: 'verify_otp_token', type: 'userVerifyOtp' }), controller.getVerifyOtp);

router.post("/password/verify-otp", isLoggedOut, checkToken({ tokenName: 'verify_otp_token', type: 'userVerifyOtp' }), validate.verifyOtp, controller.postVerifyOtp);

router.get("/password/reset", isLoggedOut, checkToken({ tokenName: 'reset-password-token', type: 'userResetPassword' }), controller.getResetPassword);

router.patch("/password/reset", isLoggedOut, checkToken({ tokenName: 'reset-password-token', type: 'userResetPassword' }), validate.resetPassword, controller.patchResetPassword);

router.get("/information", isLoggedIn, controller.getInformation);

router.patch("/addFavoriteSong", isLoggedIn, validate.addFavoriteSong, controller.addFavoriteSong);

export default router;