import express from "express";
import db from "../lib/db.js";
import { protectedRoute } from "../lib/protect.js";

const STATUS = {
    'to do': 'doing',
    'doing': 'done',
    'done': 'to do'
};

const router = express.Router();

router.post("/task", protectedRoute, async(req, res)=>{
    const user = req.user;
    const {title, description, status, deadline, priority, folder_name, group_id, usernames} = req.body;
    const folder_username = user.username;
    if (!title || !status) return res.status(400).json({error: "Missing data"});
    if (folder_name && group_id) return res.status(400).json({error: "You cannot pass folder_name and group_id"});

    const connection = await db.getConnection();
    await connection.beginTransaction();
    try {
        if(folder_name){
            const [folder] = await connection.execute("SELECT * FROM folder WHERE name = ? AND username = ?", [folder_name, folder_username]);
            if (folder.length === 0) return res.status(400).json({error: `Folder ${folder_name} does not exist`});
        }

        const [taskResult] = await connection.execute("INSERT INTO task (title, description, status, deadline, priority, folder_name, folder_username, group_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)", [title, description || null, status, deadline || null, priority || null, folder_name || null, folder_name ? folder_username : null, group_id || null ]);
        const taskId = taskResult.insertId;

        if (!group_id){
            await connection.execute("INSERT INTO task_user (task_id, username) VALUES (?, ?)", [taskId, user.username]);
            await connection.commit();
            return res.status(201).json({message: "Task created successfully", task: {id: taskId, title, description, status, deadline, priority, folder_name, createdBy: user.username}});
        }

        const usersToAdd = new Set(usernames);
        for (const username of usersToAdd){
            const [verif] = await connection.execute("SELECT * FROM user WHERE username = ?", [username]);
            if (verif.length === 0) return res.status(400).json({error: `User ${username} does not exist`});

            const [result] = await connection.execute("SELECT * FROM group_user WHERE username = ? AND group_id = ?", [username, group_id]);
            if (result.length === 0){
                connection.rollback();
                return res.status(400).json({error: `User ${username} not found in group`});
            }

            await connection.execute("INSERT INTO task_user (task_id, username) VALUES (?, ?)", [taskId, username]);
        }

        const [group] = await connection.execute("SELECT * FROM `group` WHERE id = ?", [group_id]);

        await connection.commit();
        return res.status(201).json({message: "Task created successfully", task: {id: taskResult.insertId, title, description, status, deadline, priority, group, users: [...usersToAdd], createdBy: user.username}});
    } catch (error) {
        console.error("Error in post task: ", error);
        return res.status(500).json({ error: error.message });
    } finally {
        connection.release();
    }
});

router.put("/task", protectedRoute, async(req, res)=>{
    const user = req.user;
    const {id} = req.body;
    if (!id) return res.status(400).json({error: "Missing data"});
    try {
        const [result] = await db.execute("SELECT * FROM task JOIN task_user ON task.id = task_user.task_id WHERE task.id = ? AND task_user.username = ?", [id, user.username]);
        if (result.length === 0) return res.status(400).json({error: "Action not allowed"});
        const currentStatus = result[0].status;

        const nextStatus = STATUS[currentStatus] || currentStatus;
        
        
        await db.execute("UPDATE task SET status = ? WHERE id = ?", [nextStatus, id]);
        result[0].status = nextStatus;
        return res.status(200).json(result[0]);
    } catch (error) {
        console.error("Error in put task: ", error);
        return res.status(500).json({ error: error.message });
    }
});

//route not finished
router.put("/task/update", protectedRoute, async(req, res)=>{
    const user = req.user;
    const {id, title, description, status, deadline, priority, folder_name, group_id, usernames} = req.body.data;
    if (!id) return res.status(400).json({error: "Missing id"});
    try {
        let [currentTask] = await db.execute("SELECT * FROM task JOIN task_user ON task.id = task_user.task_id WHERE task.id = ? AND task_user.username = ?", [id, user.username]);
        if (currentTask.length === 0) return res.status(400).json({error: "Action not allowed"});
        currentTask = currentTask[0];
        if (folder_name){
            const [verifFolder] = await db.execute("SELECT * FROM folder WHERE name = ? AND username = ?", [folder_name, user.username]);
            if (verifFolder.length === 0) return res.status(400).json({error: "Folder not found"});
            await db.execute("UPDATE task SET title = ?, description = ?, status = ?, deadline = ?, priority = ?, folder_name = ?, folder_username = ? WHERE id = ?", [title === currentTask.title ? title : currentTask.title, description === currentTask.description ? description : currentTask.description, status === currentTask.status ? status : currentTask.status, deadline === currentTask.deadline ? deadline : currentTask.deadline, priority === currentTask.priority ? priority : currentTask.priority, folder_name === currentTask.folder_name ? folder_name : currentTask.folder_name, user.username, id]);
        }
        return res.status(200).json({message: "pipi"});
    } catch (error) {
        console.error("Error in task update: ", error);
        return res.status(500).json({ error: error.message });
    }
});

router.delete("/task", protectedRoute, async(req, res)=>{
    const user = req.user;
    const {id} = req.body;
    if (!id) return res.status(400).json({error: "Data missing"});
    try {
        const [result] = await db.execute("SELECT * FROM task JOIN task_user ON task.id = task_user.task_id WHERE task.id = ?", [id]);
        if (result.length === 0) return res.status(400).json({error: "Not allowed"});
        if (result.length > 1){
            const [verif] = await db.execute("SELECT * FROM task JOIN task_user ON task.id = task_user.task_id WHERE task.id = ? AND task_user.username = ? ", [id, user.username]);
            if (verif.length === 0) return res.status(400).json({error: "Not allowed"});
            await db.execute("DELETE FROM task_user WHERE task_id = ? AND username = ?", [id, user.username]);
        } else if(result[0].username !== user.username) return res.status(400).json({error: "Not allowed"});
        else await db.execute("DELETE FROM task WHERE id = ?", [id]);
        return res.status(200).json({message: `Task ${id} deleted`});
    } catch (error) {
        console.error("Error in delete task: ", error);
        return res.status(500).json({ error: error.message });
    }
});

router.get("/task", protectedRoute, async(req, res)=>{
    const user = req.user;
    const {id_group, folder_name} = req.query;
    try {
        let result;
        if (id_group && folder_name) return res.status(400).json({error: "Query error"});
        else if (id_group){
            [result] = await db.execute("SELECT * FROM task JOIN task_user ON task.id = task_user.task_id WHERE group_id = ?", [id_group]);
        } else if (folder_name){
            [result] = await db.execute("SELECT * FROM task WHERE folder_name = ? AND folder_username = ?", [folder_name, user.username]);
        } else {
            [result] = await db.execute("SELECT task.*, `group`.name AS group_name, `group`.id AS group_id FROM task JOIN task_user ON task.id = task_user.task_id LEFT JOIN `group` ON task.group_id = `group`.id WHERE task_user.username = ?", [user.username]);
        }
        return res.status(200).json(result);
    } catch (error) {
        console.error("Error in get task: ", error);
        return res.status(500).json({ error: error.message });
    }
});

// for now we seperate creating group and adding people to the group, we only add the user who created the group
router.post("/group", protectedRoute, async(req, res)=>{
    const user = req.user;
    const {name} = req.body;
    if (!name) return res.status(400).json({error: "Group's name missing"});
    try {
        const [result] = await db.execute("INSERT INTO `group` (name, username) VALUES (?, ?)", [name, user.username]);
        await db.execute("INSERT INTO group_user (group_id, username) VALUES (?, ?)", [result.insertId, user.username]);
        return res.status(201).json({message: "Group created successfully", group:{id: result.insertId, name, createdBy: user.username}});
    } catch (error) {
        if (error.code === "ER_DUP_ENTRY") return res.status(400).json({error: "Group already exists"});
        console.error("Error in post groups: ", error);
        return res.status(500).json({ error: error.message });
    }
});

router.get("/group", protectedRoute, async(req, res)=>{
    const user = req.user;
    try {
        const [groups] = await db.execute("SELECT * FROM `group` JOIN group_user ON `group`.id = group_user.group_id WHERE group_user.username = ?", [user.username]);
        for (const group of groups){
            const [users] = await db.execute("SELECT username FROM group_user WHERE group_id = ?", [group.id]);
            group.users = users;
        }
        return res.status(200).json(groups);
    } catch (error) {
        console.error("Error in get groups", error);
        return res.status(500).json({ error: error.message });
    }
})

router.post("/group/addUsers", protectedRoute, async(req, res)=>{
    const user = req.user;
    const {id_group, usernames} = req.body;
    if (usernames.length === 0 || !id_group) return res.status(400).json({error: "Missing data"});

    const connection = await db.getConnection();
    await connection.beginTransaction();
    try {
        const [result] = await connection.execute("SELECT * FROM `group` WHERE id = ?", [id_group]);
        if (result.length === 0) return res.status(400).json({error: "Group not found"});
        
        const group = result[0];
        if (group.username !== user.username) return res.status(400).json({error: "Only the owner can add users"});

        const usersToAdd = new Set(usernames);
        for (const username of usersToAdd){
            await connection.execute("INSERT INTO group_user (group_id, username) VALUES (?, ?)", [id_group, username]);
        }

        await connection.commit();
        return res.status(200).json({group, usernames});
    } catch (error) {
        await connection.rollback();
        if (error.code === "ER_NO_REFERENCED_ROW_2") return res.status(400).json({error: "SQL error"}); // add verification
        if (error.code === "ER_DUP_ENTRY") return res.status(400).json({error: "User already in the group"})
        console.error(error);
        return res.status(500).json({ error: error.message });
    } finally {
        connection.release();
    }
})

router.post("/folder", protectedRoute, async(req, res)=>{
    const user = req.user;
    const {name} = req.body;
    if (!name) return res.status(400).json({error: "Folder's name missing"});
    try {
        await db.execute("INSERT INTO folder (name, username) VALUES (?, ?)", [name, user.username]);
        return res.status(201).json({message: "Folder created successfully", folder:{name, createdBy: user.username}});
    } catch (error) {
        if (error.code === "ER_DUP_ENTRY") return res.status(400).json({error: "Folder already exists"});
        console.error("Error in post folders: ", error);
        return res.status(500).json({ error: error.message });
    }
});

router.get("/folder", protectedRoute, async(req, res)=>{
    const user = req.user;
    try {
        const [result] = await db.execute("SELECT * FROM folder WHERE username = ?", [user.username]);
        return res.status(200).json(result);
    } catch (error) {
        console.error("Error in get folders", error);
        return res.status(500).json({ error: error.message });
    }
});

router.post("/folder/addTasks", protectedRoute, async(req, res)=>{
    const user = req.user;
    const {folder_name, ids} = req.body;
    if (!folder_name || ids?.length == 0) return res.status(400).json({error: "Data missing"});

    const connection = await db.getConnection();
    await connection.beginTransaction();
    try {
        const [result] = await connection.execute("SELECT * FROM folder WHERE name = ? AND username = ?", [folder_name, user.username]);
        if (result.length === 0) return res.status(400).json({error: "Folder not found"});

        const idsToAdd = new Set(ids);
        for (const id of idsToAdd){
            const [verif] = await connection.execute("SELECT * FROM task_user WHERE task_id = ? AND username = ?", [id, user.username]);
            if (verif.length === 0) return res.status(400).json({error: "Action not allowed"});

            await connection.execute("UPDATE task SET folder_username = ?, folder_name = ? WHERE id = ?", [user.username, folder_name, id]);
        }
        await connection.commit();
        return res.status(200).json({message: ids.length > 1 ? `Tasks added to ${folder_name}` : `Task added to ${folder_name}`});
    } catch (error) {
        console.error("Error in post addTasks", error);
        return res.status(500).json({ error: error.message });
    } finally {
        connection.release();
    }
});

router.get("/health", protectedRoute, (req, res)=>{
    res.status(200).json({message: "health"});
})

router.post("/dev/reset", async(req, res)=>{
    try {
        const connection = await db.getConnection();
        await connection.query("SET FOREIGN_KEY_CHECKS = 0");
        await connection.query(`
            DROP TABLE IF EXISTS task_user;
            DROP TABLE IF EXISTS task;
            DROP TABLE IF EXISTS group_user;
            DROP TABLE IF EXISTS \`group\`;
            DROP TABLE IF EXISTS folder;
            DROP TABLE IF EXISTS user;
        `);
        await connection.query("SET FOREIGN_KEY_CHECKS = 1");
        await connection.query(`
            CREATE TABLE user (
                username VARCHAR(50) PRIMARY KEY,
                password VARCHAR(255) NOT NULL
            );
        
            CREATE TABLE \`group\` (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                description TEXT,
                date DATETIME DEFAULT CURRENT_TIMESTAMP,
                username VARCHAR(50) NOT NULL,
                FOREIGN KEY (username) REFERENCES user(username) ON DELETE CASCADE ON UPDATE CASCADE
            );
        
            CREATE TABLE folder (
                name VARCHAR(100),
                date DATETIME DEFAULT CURRENT_TIMESTAMP,
                username VARCHAR(50) NOT NULL,
                PRIMARY KEY (name, username),
                FOREIGN KEY (username) REFERENCES user(username) ON DELETE CASCADE ON UPDATE CASCADE
            );
        
            CREATE TABLE task (
                id INT AUTO_INCREMENT PRIMARY KEY,
                title VARCHAR(100) NOT NULL,
                description TEXT,
                status VARCHAR(20) NOT NULL,
                deadline DATE,
                priority VARCHAR(20),
                date DATETIME DEFAULT CURRENT_TIMESTAMP,
                folder_name VARCHAR(100),
                folder_username VARCHAR(50),
                group_id INT,
                FOREIGN KEY (folder_name, folder_username) REFERENCES folder(name, username) ON DELETE CASCADE ON UPDATE CASCADE,
                FOREIGN KEY (group_id) REFERENCES \`group\`(id) ON DELETE CASCADE ON UPDATE CASCADE
            );
        
            CREATE TABLE group_user (
                username VARCHAR(50),
                group_id INT,
                PRIMARY KEY (username, group_id),
                FOREIGN KEY (username) REFERENCES user(username) ON DELETE CASCADE ON UPDATE CASCADE,
                FOREIGN KEY (group_id) REFERENCES \`group\`(id) ON DELETE CASCADE ON UPDATE CASCADE
            );
        
            CREATE TABLE task_user (
                username VARCHAR(50),
                task_id INT,
                PRIMARY KEY (username, task_id),
                FOREIGN KEY (username) REFERENCES user(username) ON DELETE CASCADE ON UPDATE CASCADE,
                FOREIGN KEY (task_id) REFERENCES task(id) ON DELETE CASCADE ON UPDATE CASCADE
            );`
        );
        connection.release();
        return res.status(200).json({message: "Database reset successfully"});
    } catch (error) {
     console.error("Error in database reset: ",error);
     return res.status(500).json({ error: error.message });   
    }
});



export default router;