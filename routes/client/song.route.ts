import express, { Router } from "express";
import * as controller from "../../controllers/client/song.controller";

const router: Router = express.Router();

router.get("/:topicSlug", controller.getSongByTopic);

export default router;