"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dashboard_route_1 = __importDefault(require("./dashboard.route"));
const topic_route_1 = __importDefault(require("./topic.route"));
const song_route_1 = __importDefault(require("./song.route"));
const upload_route_1 = __importDefault(require("./upload.route"));
const auth_route_1 = __importDefault(require("./auth.route"));
const accountAdmin_route_1 = __importDefault(require("./accountAdmin.route"));
const accountUser_route_1 = __importDefault(require("./accountUser.route"));
const role_route_1 = __importDefault(require("./role.route"));
const permission_route_1 = __importDefault(require("./permission.route"));
const singer_route_1 = __importDefault(require("./singer.route"));
const myProfile_route_1 = __importDefault(require("./myProfile.route"));
const setting_route_1 = __importDefault(require("./setting.route"));
const auth_1 = require("../../middlewares/admin/auth");
const adminRoutes = (app) => {
    const prefixAdmin = app.locals.prefixAdmin;
    app.use((0, auth_1.checkToken)({ tokenName: 'tokenAdmin', type: 'currentAdmin' }));
    app.use(`${prefixAdmin}/auth`, auth_route_1.default);
    app.use(`${prefixAdmin}/dashboard`, auth_1.isLoggedIn, dashboard_route_1.default);
    app.use(`${prefixAdmin}/my-profile`, auth_1.isLoggedIn, myProfile_route_1.default);
    app.use(`${prefixAdmin}/account-admin`, auth_1.isLoggedIn, accountAdmin_route_1.default);
    app.use(`${prefixAdmin}/account-user`, auth_1.isLoggedIn, accountUser_route_1.default);
    app.use(`${prefixAdmin}/roles`, auth_1.isLoggedIn, role_route_1.default);
    app.use(`${prefixAdmin}/permissions`, auth_1.isLoggedIn, permission_route_1.default);
    app.use(`${prefixAdmin}/topics`, auth_1.isLoggedIn, topic_route_1.default);
    app.use(`${prefixAdmin}/singers`, auth_1.isLoggedIn, singer_route_1.default);
    app.use(`${prefixAdmin}/songs`, auth_1.isLoggedIn, song_route_1.default);
    app.use(`${prefixAdmin}/upload`, auth_1.isLoggedIn, upload_route_1.default);
    app.use(`${prefixAdmin}/setting`, auth_1.isLoggedIn, setting_route_1.default);
};
exports.default = adminRoutes;