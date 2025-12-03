import { Server } from "socket.io";
import http from "http";
import express from "express";
import db from "./db.js";

const app = express ();
const server = http.createServer(app);
var groups = new Map() 
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173',  
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type'],
    credentials: true
  }
});

  io.on("connection", (socket) => {
      console.log("a user connected", socket.id);
      
      
      socket.on("disconnect", () =>{
          console.log("a user disonnected", socket.id);
      })

      socket.on("link", async user => {
        const [usergroup] = await db.execute("SELECT group_id FROM group_user WHERE username = ?", [user.username]);
        usergroup.forEach((group)=>{
          socket.join(group.group_id);
          console.log("user", user.username, "joined", group.group_id);
        })
      })

      socket.on("user_message", data => { // message group user
        socket.to(data.group).emit("serveur_message", data);
      })
  })

export {io, app, server};