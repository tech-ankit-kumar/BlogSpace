const fs = require("fs/promises");
const path = require("path");
const FILE = path.join(__dirname, "..", "data", "db.json");
let queue = Promise.resolve();

async function readDb() {
  const raw = await fs.readFile(FILE, "utf8");
  const db = JSON.parse(raw);
  return {
    users: Array.isArray(db.users) ? db.users : [],
    posts: Array.isArray(db.posts) ? db.posts : [],
    comments: Array.isArray(db.comments) ? db.comments : [],
    likes: Array.isArray(db.likes) ? db.likes : [],
    bookmarks: Array.isArray(db.bookmarks) ? db.bookmarks : []
  };
}
async function writeDb(db) {
  const task = queue.then(async () => {
    const temp = FILE + ".tmp";
    await fs.writeFile(temp, JSON.stringify(db, null, 2), "utf8");
    await fs.rename(temp, FILE);
  });
  queue = task.catch(() => {});
  return task;
}
module.exports = { readDb, writeDb };
