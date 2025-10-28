import express from "express";
import bcrypt from "bcrypt";
import db from "../lib/db.js";
import { generateToken } from "../lib/utils.js";
import { protectedRoute } from "../lib/protect.js";

const router = express.Router();

router.post('/signup', async(req, res)=>{
    const {username, password} = req.body;
    if (!username || !password) return res.status(400).json({error: "All fields are required"});
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        await db.execute("INSERT INTO users (username, password) VALUES (?, ?)", [username, hashedPassword]);

        const token = generateToken(username);
        res.cookie("token", token, {httpOnly: true, secure: false});
        return res.status(201).json({message: "User created successfully"});
    } catch (error) {
        if (error.code === "ER_DUP_ENTRY") return res.status(400).json({error: "User already exists"});
        console.log("Error in signup: ", error);
        return res.status(500).json({error: "Internal error"});
    }
});

router.post('/login', async(req, res)=>{
    const {username, password} = req.body;
    if (!username || !password) return res.status(400).json({error: "All fields are required"});
    try {
        const [rows] = await db.execute("SELECT * FROM users where username = ?", [username]);
        const user = rows[0];
        if (!user) return res.status(400).json({error: "Invalid credentials"});

        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) return res.status(400).json({error: "Invalid credentials"});

        const token = generateToken(username);
        res.cookie("token", token, {httpOnly: true, secure: false});
        return res.status(200).json({message: "Logged in successfully", user: {user: user.username}});
    } catch (error) {
        console.error("Error in login: ", error);
        return res.status(500).json({ error: "Internal error"});
    }
});

router.post('/logout', protectedRoute, async(req, res)=>{
    try {
        res.clearCookie("token");
        return res.status(200).json({message: "Logged out successfully"});
    } catch (error) {
        console.error("Error in logout: ", error);
        return res.status(500).json({ error: "Internal error" });
    }
});

router.get('/check', protectedRoute, (req, res)=>{
    const user = req.user;
    return res.status(200).json(user);
})

export default router;