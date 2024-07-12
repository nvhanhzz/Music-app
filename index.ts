import express, { Application } from "express";
import dotenv from "dotenv";
import connectDB from "./config/database";

// Load environment variables from .env file
dotenv.config();

// Connect to mongodb
connectDB();

const app: Application = express();
const port: number | string = parseInt(process.env.PORT as string, 10) || 5678;

app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});