import { Application } from "express";
import topicRoutes from "./topic.route";
import songRoutes from "./song.route";
import userRoutes from "./user.route";
import homeRoutes from "./home.route";
import searchRoutes from "./search.route";
import { checkToken } from "../../middlewares/client/auth";

const clientRoutes = (app: Application): void => {
    app.use(checkToken({ tokenName: 'token', type: 'currentUser' }));

    app.use("/topics", topicRoutes);
    app.use("/songs", songRoutes);
    app.use("/search", searchRoutes);
    app.use("/user", userRoutes);
    app.use("/", homeRoutes);
}

export default clientRoutes;