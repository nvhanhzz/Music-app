import { Application } from "express";
import dashboardRoute from "./dashboard.route";
import topicRoute from "./topic.route";
import songRoute from "./song.route";

// import { checkToken } from "../../middlewares/auth";

const adminRoutes = (app: Application): void => {
    const prefixAdmin = app.locals.prefixAdmin;

    app.use(`${prefixAdmin}/dashboard`, dashboardRoute);
    app.use(`${prefixAdmin}/topics`, topicRoute);
    app.use(`${prefixAdmin}/songs`, songRoute);
}

export default adminRoutes;