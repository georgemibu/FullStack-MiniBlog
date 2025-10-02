import express from "express";
import cors from "cors";
import sqlite3 from "sqlite3";
import { open } from "sqlite";

const app = express();
app.use(cors());
app.use(express.json());

const dbPromise = open({
    filename: './database.db',
    driver: sqlite3.Database,
});

(async () => {
    const db = await dbPromise;
    await db.exec(`
CREATE TABLE IF NOT EXISTS users (
id INTEGER PRIMARY KEY AUTOINCREMENT,
name TEXT NOT NULL
);
`);
    await db.exec(`
CREATE TABLE IF NOT EXISTS posts (
id INTEGER PRIMARY KEY AUTOINCREMENT,
title TEXT NOT NULL,
content TEXT NOT NULL,
user_id INTEGER,
FOREIGN KEY(user_id) REFERENCES users(id)
);
`);
    await db.exec(`
CREATE TABLE IF NOT EXISTS comments (
id INTEGER PRIMARY KEY AUTOINCREMENT,
content TEXT NOT NULL,
user_id INTEGER,
post_id INTEGER,
FOREIGN KEY(user_id) REFERENCES users(id),
FOREIGN KEY(post_id) REFERENCES posts(id)
);
`);
})();

//Endpoints
//Users
app.post('/users', async (req, res) => {
    const db = await dbPromise;
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: 'name required' });
    const result = await db.run('INSERT INTO users (name) VALUES (?)', name);
    res.status(201).json({ id: result.lastID, name });
})

app.get('/users', async (req, res) => {
    const db = await dbPromise;
    res.json(await db.all('SELECT * FROM users'));
});

// Posts
app.post('/posts', async (req, res) => {
    const db = await dbPromise;
    const { title, content, user_id } = req.body;
    if (!title || !content) return res.status(400).json({ error: 'title and content required' });
    const result = await db.run('INSERT INTO posts (title, content, user_id) VALUES (?, ?, ?)', [title, content, user_id]);
    res.status(201).json({ id: result.lastID, title, content, user_id });
});

app.get('/posts', async (req, res) => {
    const db = await dbPromise;
    const posts = await db.all(`
        SELECT p.*, u.name as author
        FROM posts p
        JOIN users u ON u.id = p.user_id
    `);
    res.json(posts);
});

// Comments
app.post('/comments', async (req, res) => {
    const db = await dbPromise;
    const { content, user_id, post_id } = req.body;
    if (!content) return res.status(400).json({ error: 'content required' });
    const result = await db.run('INSERT INTO comments (content, user_id, post_id) VALUES (?, ?, ?)', [content, user_id, post_id]);
    res.status(201).json({ id: result.lastID, content, user_id, post_id });
});


app.get('/comments', async (req, res) => {
    const db = await dbPromise;
    const { post_id } = req.query;
    const comments = await db.all(
        `SELECT c.*, u.name as author FROM comments c JOIN users u ON u.id = c.user_id WHERE post_id = ?`,
        [post_id]
    );
    res.json(comments);
});

const PORT = 3001;
app.listen(PORT, () => console.log(`Backend corriendo en http://localhost:${PORT}`));