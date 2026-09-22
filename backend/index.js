const express = require("express");
const cors = require("cors");

const { MongoClient } = require("mongodb");

const app = express();

app.use(express.json());
app.use(cors());
const client = new MongoClient("mongodb://127.0.0.1:27017");
let articles;

app.get("/health", (req, res) => {
  res.send("health is perfect");
});

async function connectdb() {
  await client.connect();
  console.log("mongodb is connected");

  const db = client.db("minimedium");
   articles = db.collection("articles");

  app.get("/get-all-articles", async (req, res) => {
    const data = await articles.find().toArray();

    res.json(data);
  });
}
connectdb();

app.post("/articles", async (req, res) => {
  const { title, content } = req.body;

  const article = {
    title: title,
    content: content,
  };
 // console.log(title);
  
 // console.log(content);

  await articles.insertOne(article);

  res.json({
    message: "article posted",
    article: article
  });
});

app.listen(3000, () => {
  console.log("server is running on port 3000");
});
