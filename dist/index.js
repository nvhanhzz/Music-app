"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const moment_1 = __importDefault(require("moment"));
const body_parser_1 = __importDefault(require("body-parser"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const express_session_1 = __importDefault(require("express-session"));
const express_flash_1 = __importDefault(require("express-flash"));
const method_override_1 = __importDefault(require("method-override"));
const database_1 = __importDefault(require("./config/database"));
const index_route_1 = __importDefault(require("./routes/client/index.route"));
const index_route_2 = __importDefault(require("./routes/admin/index.route"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config();
(0, database_1.default)();
const app = (0, express_1.default)();
const port = parseInt(process.env.PORT, 10) || 5678;
app.use((0, method_override_1.default)("_method"));
app.use(body_parser_1.default.urlencoded({ extended: false }));
app.use(body_parser_1.default.json());
app.use((0, cookie_parser_1.default)('abcxyz'));
app.use((0, express_session_1.default)({
    secret: process.env.SESSION_KEY,
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 60000 }
}));
app.use((0, express_flash_1.default)());
;
app.set("views", path_1.default.join(__dirname, "views"));
app.set("view engine", "pug");
app.use(express_1.default.static(path_1.default.join(__dirname, "public")));
app.locals.prefixAdmin = process.env.PATH_ADMIN;
app.locals.moment = moment_1.default;
app.use('/tinymce', express_1.default.static(path_1.default.join(__dirname, 'node_modules', 'tinymce')));
(0, index_route_1.default)(app);
(0, index_route_2.default)(app);
app.get("*", (req, res) => {
    res.render("client/pages/errors/404", {
        pageTitle: "404 Not Found"
    });
});
app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});
