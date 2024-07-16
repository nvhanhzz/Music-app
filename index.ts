import express, { Application, Request, Response } from "express";
import dotenv from "dotenv";
import moment from "moment";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import session from 'express-session';
import flash from 'express-flash';
import methodOverride from "method-override";
import connectDB from "./config/database";
import clientRoutes from "./routes/client/index.route";
import adminRoutes from "./routes/admin/index.route";

// Load environment variables from .env file
dotenv.config();

// Connect to mongodb
connectDB();

const app: Application = express();
const port: number | string = parseInt(process.env.PORT as string, 10) || 5678;

// method override
app.use(methodOverride("_method"));

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json());

// cookie parser
app.use(cookieParser('abcxyz'));

// config flash
app.use(session({
    secret: process.env.SESSION_KEY,
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 60000 }
}));
app.use(flash());;

// render view
app.set("views", "./views");
app.set("view engine", "pug");

// public folder
app.use(express.static("public"));

// app local variables
app.locals.prefixAdmin = process.env.PATH_ADMIN
app.locals.moment = moment;

clientRoutes(app);
adminRoutes(app);
app.get("*", (req: Request, res: Response): void => {
    res.render("client/pages/errors/404", {
        pageTitle: "404 Not Found"
    });
})

app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});