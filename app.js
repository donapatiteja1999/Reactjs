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

const outputToList = (list) => {
  const l = list.map((e) => ({
    id: e.id,
    todo: e.todo,
    priority: e.priority,
    category: e.category,
    status: e.status,
    dueDate: e.due_date,
  }));
  return l;
};

//  API 1

app.get("/todos/", async (request, response) => {
  const {
    status = "",
    priority = "",
    search_q = "",
    category = "",
  } = request.query;
  if (status !== "" && priority === "" && search_q === "" && category === "") {
    const statusToDo = `SELECT *FROM todo WHERE status="${status}" order by id;`;
    let list = null;
    try {
      list = await db.all(statusToDo);
      response.status(200);
      list = outputToList(list);

      response.send(list);
    } catch (e) {
      console.log(e);
      response.send("sqlite error");
    }
  } else if (
    priority !== "" &&
    status === "" &&
    search_q === "" &&
    category === ""
  ) {
    const statusToDo = `SELECT *FROM todo WHERE priority="${priority}" order by id;`;
    let list = null;
    try {
      list = await db.all(statusToDo);
      list = outputToList(list);

      response.send(list);
    } catch (e) {
      console.log(e);
      response.send("sqlite error");
    }
  } else if (
    status !== "" &&
    priority !== "" &&
    category === "" &&
    search_q === ""
  ) {
    const statusToDo = `SELECT *FROM todo WHERE priority="${priority}" and status="${status}" order by id;`;
    let list = null;
    try {
      list = await db.get(statusToDo);
      list = outputToList([list]);
      response.send(list);
      response.status(200);
    } catch (e) {
      console.log(e);
      response.send("sqlite error");
    }
  }
  if (search_q !== "" && priority === "" && category === "" && status === "") {
    const statusToDo = `SELECT *FROM todo WHERE todo like "%${search_q}%" order by id;`;
    let list = null;
    try {
      list = await db.get(statusToDo);
      list = outputToList([list]);
      response.send(list);
      response.status(200);
    } catch (e) {
      console.log(e);
      response.send("sqlite error");
    }
  }
  if (category !== "" && status !== "" && priority === "" && search_q === "") {
    const statusToDo = `SELECT *FROM todo WHERE category="${category}" and status="${status}" order by id;`;
    let list = null;
    try {
      list = await db.get(statusToDo);
      list = outputToList([list]);
      response.send(list);
      response.status(200);
    } catch (e) {
      console.log(e);
      response.send("sqlite error");
    }
  }
  if (category !== "" && priority === "" && search_q === "" && status === "") {
    const statusToDo = `SELECT *FROM todo WHERE category="${category}" order by id;`;
    let list = null;
    try {
      list = await db.get(statusToDo);
      list = outputToList([list]);
      response.send(list);
      response.status(200);
    } catch (e) {
      console.log(e);
      response.send("sqlite error");
    }
  }
  if (category !== "" && priority !== "" && search_q === "" && status === "") {
    const statusToDo = `SELECT *FROM todo WHERE category="${category}" and priority="${priority}" order by id;`;
    let list = null;
    try {
      list = await db.get(statusToDo);
      list = outputToList([list]);
      response.send(list);
      response.status(200);
    } catch (e) {
      console.log(e);
      response.send("sqlite error");
    }
  }
});

//  API 2

app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const query = `SELECT *FROM todo WHERE id=${todoId};`;
  try {
    let list = await db.get(query);
    list = toArray([list]);
    console.log(list);
    response.send(list[0]);
  } catch (e) {
    response.send(e);
  }
});

//  API 3

app.get("/agenda/", async (request, response) => {
  const { date } = request.query;
  const query = `SELECT *FROM todo WHERE due_date="${date}";`;
  try {
    let list = await db.get(query);
    if (list[0] === undefined) {
      list = toArray([list]);
    } else {
      list = toArray(list);
    }
    response.send(list);
  } catch (e) {
    response.send(e);
  }
});

//  API 4

app.post("/todos/", async (request, response) => {
  const { id, status, category, priority, dueDate, todo } = request.body;
  let flag = 0;
  if (status === "TO DO" || status === "PROGRESS" || status === "DONE") {
    flag = 0;
  } else {
    response.send("Invalid Todo Status");
    response.status(400);
    flag = 1;
  }
  if (priority === "HIGH" || priority === "MEDIUM" || priority === "LOW") {
    flag = 0;
  } else {
    response.send("Invalid Todo Priority");
    response.status(400);
    flag = 1;
  }
  if (category === "WORK" || category === "HOME" || category === "LEARNING") {
    flag = 0;
  } else {
    response.send("Invalid Todo Category");
    response.status(400);
    flag = 1;
  }
  if (flag === 0) {
    const query = `insert into todo(id,todo,category,priority,status,due_date) values(${id},"${todo}","${category}","${priority}","${status}","${dueDate}");`;
    try {
      const list = await db.run(query);
      console.log(list);
      response.send("Todo Successfully Added");
    } catch (e) {
      response.send(e);
    }
  }
});

//  API 5

app.put("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const {
    status = "",
    priority = "",
    category = "",
    dueDate = "",
    todo = "",
  } = request.body;
  if (status !== "") {
    if (status === "TO DO" || status === "IN PROGRESS" || status === "DONE") {
      const query = `update todo set status="${status}" where id=${todoId};`;
      try {
        await db.run(query);
        response.send("Status Updated");
      } catch (e) {
        response.send(e);
      }
    } else {
      response.send("Invalid Todo Status");
      response.status = 400;
    }
  } else if (priority !== "") {
    if (priority === "HIGH" || priority === "MEDIUM" || priority === "LOW") {
      const query = `update todo set priority="${priority}" where id=${todoId};`;
      try {
        await db.run(query);
        response.send("Priority Updated");
      } catch (e) {
        response.send(e);
      }
    } else {
      response.send("Invalid Todo Priority");
      response.status(400);
    }
  } else if (category !== "") {
    if (category === "WORK" || category === "HOME" || category === "LEARNING") {
      const query = `update todo set category="${category}" where id=${todoId};`;
      try {
        await db.run(query);
        response.send("Category Updated");
      } catch (e) {
        response.send(e);
      }
    } else {
      response.send("Invalid Todo Category");
      response.status(400);
    }
  } else if (todo !== "") {
    const query = `update todo set todo="${todo}" where id=${todoId};`;
    try {
      await db.run(query);
      response.send("Todo Updated");
    } catch (e) {
      response.send(e);
    }
  } else if (dueDate !== "") {
    const query = `update todo set due_date="${dueDate}" where id=${todoId};`;
    try {
      await db.run(query);
      response.send("Due Date Updated");
    } catch (e) {
      response.send(e);
    }
  }
});

//  API 6

app.delete("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const query = `DELETE FROM todo where id=${todoId};`;
  try {
    await db.run(query);
    response.send("Todo Deleted");
  } catch (e) {
    response.send(e);
  }
});

module.exports = app;
