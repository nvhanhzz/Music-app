import express, { Router } from "express";
import * as validate from "../../validate/client/song.validate";
import * as controller from "../../controllers/client/song.controller";
import { isLoggedIn } from "../../middlewares/auth";

const router: Router = express.Router();

router.get("/detail/:slug", controller.getSongDetail);

router.get("/:topicSlug", controller.getSongByTopic);

router.patch("/like", isLoggedIn, validate.validatePatchLike, controller.patchLike);

export default router;