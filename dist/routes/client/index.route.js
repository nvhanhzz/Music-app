"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const topic_route_1 = __importDefault(require("./topic.route"));
const song_route_1 = __importDefault(require("./song.route"));
const user_route_1 = __importDefault(require("./user.route"));
const home_route_1 = __importDefault(require("./home.route"));
const search_route_1 = __importDefault(require("./search.route"));
const auth_1 = require("../../middlewares/client/auth");
const setting_1 = require("../../middlewares/client/setting");
const clientRoutes = (app) => {
    app.use(setting_1.generalSetting);
    app.use((0, auth_1.checkToken)({ tokenName: 'token', type: 'currentUser' }));
    app.use("/topics", topic_route_1.default);
    app.use("/songs", song_route_1.default);
    app.use("/search", search_route_1.default);
    app.use("/user", user_route_1.default);
    app.use("/", home_route_1.default);
};
exports.default = clientRoutes;
