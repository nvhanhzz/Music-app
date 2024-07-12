import { Application } from "express";
import topicRoutes from "./topic.route";

const clientRoutes = (app: Application): void => {
    app.use("/topics", topicRoutes);
}

export default clientRoutes;