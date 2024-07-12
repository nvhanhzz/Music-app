import express, { Application } from "express";
import dotenv from "dotenv";
import moment from "moment";
import connectDB from "./config/database";
import clientRoutes from "./routes/client/index.route";

// Load environment variables from .env file
dotenv.config();

// Connect to mongodb
connectDB();

const app: Application = express();
const port: number | string = parseInt(process.env.PORT as string, 10) || 5678;

// render view
app.set("views", "./views");
app.set("view engine", "pug");

// public folder
app.use(express.static("public"));

// app local variables
app.locals.moment = moment;

clientRoutes(app);
app.get("*", (req, res) => {
    res.render("client/pages/errors/404", {
        pageTitle: "404 Not Found"
    });
})

app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});