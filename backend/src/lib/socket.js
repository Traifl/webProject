import { Server } from "socket.io";
import db from './db.js'

export default function initializeSocket(httpServer) {
    const io = new Server(httpServer, {
        cors: {
            origin: "http://localhost:5173",
            methods: ["GET", "POST"],
            credentials: true
        }
    });

    io.use((socket, next) => {
        const username = socket.handshake.auth.username;
        if (!username) {
            return next(new Error("Invalid username"));
        }
        socket.username = username;
        next();
    });

    io.on("connection", (socket) => {
        console.log(`[Socket] Connected: ${socket.username} (${socket.id})`);

        socket.on("join_group", async (groupId) => {
            try {
                const [rows] = await db.query("SELECT * FROM group_user WHERE username = ? AND group_id = ?",[socket.username, groupId]);

                if (rows.length > 0) {
                    const roomName = `group_${groupId}`;
                    socket.join(roomName);
                    console.log(`[Socket] ${socket.username} joined ${roomName}`);
                } else {
                    socket.emit("error", "Access denied");
                }
            } catch (err) {
                console.error("[Socket Error]", err);
            }
        });

        socket.on("leave_group", (groupId) => {
            socket.leave(`group_${groupId}`);
        });

        socket.on("send_message", async (data) => {
            const { content, groupId } = data;
            if (!content || !groupId) return;
            try {
                const [result] = await db.query("INSERT INTO message (content, username, group_id) VALUES (?, ?, ?)", [content, socket.username, groupId]);

                const newMessage = {id: result.insertId, content: content, username: socket.username, group_id: groupId, date: new Date()};

                io.to(`group_${groupId}`).emit("receive_message", newMessage);
            } catch (err) {
                console.error("[Socket Error]", err);
                socket.emit("error", "Erreur d'envoi");
            }
        });

        socket.on("disconnect", () => {
            console.log(`[Socket] Disconnected: ${socket.username}`);
        });
    });
}