import express from "express";
import cors from "cors";
import cookieParser from 'cookie-parser';
import db from "./lib/db.js";

import authRoutes from "./routes/auth.js";
import apiRoutes from "./routes/api.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use(cookieParser());

const PORT = process.env.PORT;

app.use("/api/auth", authRoutes);
app.use("/api", apiRoutes);

app.listen(PORT, "0.0.0.0", async()=>{
    console.log(`server running on port ${PORT}`);
    try {
        await db.query("SELECT 1");
        console.log("connected to mysql");
    } catch (err) {
        console.log("error in database connection: ", err);
    }
});