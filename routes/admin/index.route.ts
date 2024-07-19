import { Application } from "express";
import dashboardRoute from "./dashboard.route";
import topicRoute from "./topic.route";
import songRoute from "./song.route";
import uploadRoute from "./upload.route";
import authRoute from "./auth.route";
import accountAdminRoute from "./accountAdmin.route";
import accountUserRoute from "./accountUser.route";
import roleRoute from "./role.route";
import permissionRoute from "./permission.route";

import { checkToken, isLoggedIn } from "../../middlewares/admin/auth";

// import { checkToken } from "../../middlewares/auth";

const adminRoutes = (app: Application): void => {
    const prefixAdmin = app.locals.prefixAdmin;

    app.use(checkToken({ tokenName: 'tokenAdmin', type: 'currentAdmin' }));

    app.use(`${prefixAdmin}/auth`, authRoute);
    app.use(`${prefixAdmin}/dashboard`, isLoggedIn, dashboardRoute);
    app.use(`${prefixAdmin}/account-admin`, isLoggedIn, accountAdminRoute);
    app.use(`${prefixAdmin}/account-user`, isLoggedIn, accountUserRoute);
    app.use(`${prefixAdmin}/roles`, isLoggedIn, roleRoute);
    app.use(`${prefixAdmin}/permissions`, isLoggedIn, permissionRoute);
    app.use(`${prefixAdmin}/topics`, isLoggedIn, topicRoute);
    app.use(`${prefixAdmin}/songs`, isLoggedIn, songRoute);
    app.use(`${prefixAdmin}/upload`, isLoggedIn, uploadRoute);
}

export default adminRoutes;