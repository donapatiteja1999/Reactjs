const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");

const app = express();

const dbPath = path.join(__dirname, "todoApplication.db");

app.use(express.json());

let db = null;

const initializeDb = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });

    await app.listen(3000, () => console.log("running on port 3000"));
  } catch (e) {
    console.log(e);
    process.exit(1);
  }
};

initializeDb();

app.get("/todos/", async (request, response) => {
  const {
    status = "",
    priority = "",
    search_q = "",
    category = "",
  } = request.query;
  if (status !== "" && priority === "") {
    const statusToDo = `SELECT *FROM todo WHERE status="${status}";`;
    let list = null;
    try {
      list = await db.all(statusToDo);
      response.status(200);

      response.send(list);
    } catch (e) {
      console.log(e);
      response.send("sqlite error");
    }
  } else if (priority !== "" && status === "") {
    const statusToDo = `SELECT *FROM todo WHERE priority="${priority}";`;
    let list = null;
    try {
      list = await db.all(statusToDo);

      response.send(list);
    } catch (e) {
      console.log(e);
      response.send("sqlite error");
    }
  } else if (status !== "" && priority !== "") {
    const statusToDo = `SELECT *FROM todo WHERE priority="${priority}" and status="${status}";`;
    let list = null;
    try {
      list = await db.get(statusToDo);
      response.send(list);
      response.status(200);
    } catch (e) {
      console.log(e);
      response.send("sqlite error");
    }
  }
  if (search_q !== "") {
    const statusToDo = `SELECT *FROM todo WHERE todo like "%${search_q}%";`;
    let list = null;
    try {
      list = await db.get(statusToDo);

      response.send(list);

      response.status(200);
    } catch (e) {
      console.log(e);
      response.send("sqlite error");
    }
  }
  if (category !== "" && status !== "") {
    const statusToDo = `SELECT *FROM todo WHERE category="${category}" and status="${status}";`;
    let list = null;
    try {
      list = await db.get(statusToDo);
      response.send(list);
      response.status(200);
    } catch (e) {
      console.log(e);
      response.send("sqlite error");
    }
  }
  if (category !== "") {
    const statusToDo = `SELECT *FROM todo WHERE category="${category}";`;
    let list = null;
    try {
      list = await db.get(statusToDo);
      response.send(list);
      response.status(200);
    } catch (e) {
      console.log(e);
      response.send("sqlite error");
    }
  }
});

module.exports = app;
