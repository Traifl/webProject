import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

const db = mysql.createPool({
    host: "localhost",
    user: "root",
    password: process.env.DB_PASSWORD,
    database: "testWeb",
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    multipleStatements: true
});

export default db;