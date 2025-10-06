import express from "express";
import db from "../lib/db.js";
import { protectedRoute } from "../lib/protect.js";

const router = express.Router();

router.post("/tasks", protectedRoute, async(req, res)=>{
    const user = req.user;
    const {title, description, status, id_group, folder_name, usernames} = req.body;
    const folder_owner = user.username;
    if (!title || !status) return res.status(400).json({error: "Missing data"});

    const connection = await db.getConnection();
    await connection.beginTransaction();

    try {
        const [taskResult] = await connection.execute("INSERT INTO tasks (title, description, status, id_group, folder_name, folder_owner) VALUES (?, ?, ?, ?, ?, ?)", [title, description || null, status, id_group || null, folder_name || null, folder_name ? folder_owner : null]);
        const taskId = taskResult.insertId
        
        if (!id_group){
            await connection.execute("INSERT INTO task_user (id_task, username) VALUES (?, ?)", [taskId, user.username]);
            await connection.commit();
            return res.status(201).json({message: "Task created successfully", task: {id: taskId, title, description, status, folder_name: folder_name || null, folder_owner: folder_name ? folder_owner : null, createdBy: user.username}});
        }

        if (!Array.isArray(usernames) || usernames.length === 0){
            await connection.rollback();
            return res.status(400).json({error: "No user selected"});
        }

        const usersToAdd = new Set(usernames);
        for (const username of usersToAdd){
            const [result] = await connection.execute("SELECT * FROM group_user WHERE username = ? AND id_group = ?", [username, id_group]);
            if (result.length === 0){
                connection.rollback();
                return res.status(400).json({error: `User ${username} not found in group`});
            }
            await connection.execute("INSERT INTO task_user (id_task, username) VALUES (?, ?)", [taskId, username]);
        }

        await connection.commit();
        return res.status(201).json({message: "Task created successfully", task: {id: taskResult.insertId, title, description, status, id_group: id_group ||null, users: [...usersToAdd], createdBy: user.username}});

    } catch (error) {
        await connection.rollback();
        if (error.code === "ER_NO_REFERENCED_ROW_2") return res.status(400).json({error: "SQL error"});
        console.error("Error in post tasks: ", error);
        return res.status(500).json({ error: error.message });
    } finally {
        connection.release();
    }
});

router.get("/tasks", protectedRoute, async(req, res)=>{
    const user = req.user;
    const {id_group, folder_name} = req.query;
    try {
        let result;
        if (id_group && folder_name) return res.status(400).json({error: "Query error"});
        else if (id_group){
            [result] = await db.execute("SELECT * FROM tasks JOIN task_user ON tasks.id = task_user.id_task WHERE tasks.id_group = ?", [id_group]);
        } else if (folder_name){
            [result] = await db.execute("SELECT * FROM tasks WHERE tasks.folder_name = ? AND tasks.folder_owner = ?", [folder_name, user.username]);
        } else {
            [result] = await db.execute("SELECT * FROM tasks JOIN task_user ON tasks.id = task_user.id_task WHERE task_user.username = ?", [user.username]);
        }
        return res.status(200).json(result);
    } catch (error) {
        
    }
});

// pour l'instant on sépare créer le groupe et ajouter les gens, on rajoute seulement la personne qui a crée le groupe automatqieuement
router.post("/groups", protectedRoute, async(req, res)=>{
    const user = req.user;
    const {name} = req.body;
    if (!name) return res.status(400).json({error: "Group's name missing"});
    try {
        const [result] = await db.execute("INSERT INTO `groups` (name, owner) VALUES (?, ?)", [name, user.username]);
        await db.execute("INSERT INTO group_user (id_group, username) VALUES (?, ?)", [result.insertId, user.username]);
        return res.status(201).json({message: "Group created successfully", group:{id: result.insertId, name, createdBy: user.username}});
    } catch (error) {
        if (error.code === "ER_DUP_ENTRY") return res.status(400).json({error: "Group already exists"});
        console.error("Error in post groups: ", error);
        return res.status(500).json({ error: error.message });
    }
});

router.post("/groups/addUsers", protectedRoute, async(req, res)=>{
    const user = req.user;
    const {id_group, usernames} = req.body;
    if (usernames.length === 0 || !id_group) return res.status(400).json({error: "Missing data"});

    const connection = await db.getConnection();
    await connection.beginTransaction();
    try {
        const [result] = await connection.execute("SELECT * FROM `groups` WHERE id = ?", [id_group]);
        if (result.length === 0) return res.status(400).json({error: "Group not found"});
        
        const group = result[0];
        if (group.owner !== user.username) return res.status(400).json({error: "Only the owner can add users"});

        const usersToAdd = new Set(usernames);
        for (const username of usersToAdd){
            await connection.execute("INSERT INTO group_user (id_group, username) VALUES (?, ?)", [id_group, username]);
        }

        await connection.commit();
        return res.status(200).json({group, usernames});
    } catch (error) {
        await connection.rollback();
        if (error.code === "ER_NO_REFERENCED_ROW_2") return res.status(400).json({error: "SQL error"}); // soit qu'un des usernames n'existe pas 
        if (error.code === "ER_DUP_ENTRY") return res.status(400).json({error: "User already in the group"})
        console.error(error);
        return res.status(500).json({ error: error.message });
    } finally {
        connection.release();
    }
})

router.post("/folders", protectedRoute, async(req, res)=>{
    const user = req.user;
    const {name} = req.body;
    if (!name) return res.status(400).json({error: "Folder's name missing"});
    try {
        const [result] = await db.execute("INSERT INTO folders (name, owner) VALUES (?, ?)", [name, user.username]);
        return res.status(201).json({message: "Folder created successfully", folder:{name, createdBy: user.username}});
    } catch (error) {
        if (error.code === "ER_DUP_ENTRY") return res.status(400).json({error: "Folder already exists"});
        console.error("Error in post folders: ", error);
        return res.status(500).json({ error: error.message });
    }
});

router.post("/dev/reset", async(req, res)=>{
    try {
        const connection = await db.getConnection();
        await connection.query("SET FOREIGN_KEY_CHECKS = 0");
        await connection.query(`
            DROP TABLE IF EXISTS task_user;
            DROP TABLE IF EXISTS tasks;
            DROP TABLE IF EXISTS group_user;
            DROP TABLE IF EXISTS \`groups\`;
            DROP TABLE IF EXISTS folders;
            DROP TABLE IF EXISTS users;`
        );
        await connection.query("SET FOREIGN_KEY_CHECKS = 1");
        await connection.query(`
            CREATE TABLE users (
                username VARCHAR(100) PRIMARY KEY,
                password VARCHAR(255) NOT NULL
            );

            CREATE TABLE folders (
                name VARCHAR(255) NOT NULL,
                date DATETIME DEFAULT CURRENT_TIMESTAMP,
                owner VARCHAR(100) NOT NULL,
                PRIMARY KEY (owner, name),
                FOREIGN KEY (owner) REFERENCES users(username) ON DELETE CASCADE ON UPDATE CASCADE
            );

            CREATE TABLE \`groups\` (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                date DATETIME DEFAULT CURRENT_TIMESTAMP,
                owner VARCHAR(100) NOT NULL,
                FOREIGN KEY (owner) REFERENCES users(username) ON DELETE CASCADE ON UPDATE CASCADE
            );

            CREATE TABLE group_user (
                id_group INT NOT NULL,
                username VARCHAR(100) NOT NULL,
                PRIMARY KEY (id_group, username),
                FOREIGN KEY (id_group) REFERENCES \`groups\`(id) ON DELETE CASCADE ON UPDATE CASCADE,
                FOREIGN KEY (username) REFERENCES users(username) ON DELETE CASCADE ON UPDATE CASCADE
            );

            CREATE TABLE tasks (
                id INT AUTO_INCREMENT PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                description TEXT,
                status VARCHAR(50) NOT NULL,
                date DATETIME DEFAULT CURRENT_TIMESTAMP,
                id_group INT,
                folder_owner VARCHAR(100),
                folder_name VARCHAR(255),
                FOREIGN KEY (id_group) REFERENCES \`groups\`(id) ON DELETE SET NULL ON UPDATE CASCADE,
                FOREIGN KEY (folder_owner, folder_name) REFERENCES folders(owner, name) ON DELETE SET NULL ON UPDATE CASCADE
            );

            CREATE TABLE task_user (
                id_task INT NOT NULL,
                username VARCHAR(100) NOT NULL,
                PRIMARY KEY (id_task, username),
                FOREIGN KEY (id_task) REFERENCES tasks(id) ON DELETE CASCADE ON UPDATE CASCADE,
                FOREIGN KEY (username) REFERENCES users(username) ON DELETE CASCADE ON UPDATE CASCADE 
            );`
        );
        await connection.release();
        return res.status(200).json({message: "Database reset successfully"});
    } catch (error) {
     console.error("Error in database reset: ",error);
     return res.status(500).json({ error: error.message });   
    }
});



export default router;