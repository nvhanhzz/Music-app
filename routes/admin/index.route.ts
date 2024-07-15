import { Application } from "express";
import dashboardRoute from "./dashboard.route";

// import { checkToken } from "../../middlewares/auth";

const adminRoutes = (app: Application): void => {
    const prefixAdmin = app.locals.prefixAdmin;

    app.use(prefixAdmin + "/dashboard", dashboardRoute);
}

export default adminRoutes;