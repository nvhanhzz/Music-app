import express, { Router } from "express";
import * as validate from "../../validate/client/song.validate";
import * as controller from "../../controllers/client/song.controller";
import { isLoggedIn } from "../../middlewares/client/auth";

const router: Router = express.Router();

router.get("/favorite", isLoggedIn, controller.getFavoriteSong);

router.get("/detail/:slug", controller.getSongDetail);

router.get("/topic/:topicSlug", controller.getSongByTopic);

router.get("/singer/:singerSlug", controller.getSongBySinger);

router.patch("/like", isLoggedIn, validate.validatePatchLike, controller.patchLike);

router.patch("/increaseListenCount", controller.increaseListenCount);

export default router;