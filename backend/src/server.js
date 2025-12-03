import express from "express";
import cors from "cors";
import cookieParser from 'cookie-parser';
import {createServer} from 'node:http';
import db from "./lib/db.js";

import initializeSocket from "./lib/socket.js";
import authRoutes from "./routes/auth.js";
import apiRoutes from "./routes/api.js";

const app = express();

app.use(cors({origin: 'http://localhost:5173', credentials: true,}));
app.use(express.json());
app.use(cookieParser());

const PORT = process.env.PORT;

app.use("/api/auth", authRoutes);
app.use("/api", apiRoutes);

const httpServer = createServer(app);

initializeSocket(httpServer);

httpServer.listen(PORT, "0.0.0.0", async()=>{
    console.log(`server running on port ${PORT}`);
    try {
        await db.query("SELECT 1");
        console.log("connected to mysql");
    } catch (err) {
        console.log("error in database connection: ", err);
    }
});