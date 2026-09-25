const express = require("express");
const cors = require("cors");

const { MongoClient, ObjectId } = require("mongodb");

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

  app.get("/get-article/:id", async (req, res) => {
    try {
      const id = req.params.id;

      if (!ObjectId.isValid(id)) {
        return res.status(400).json({
          message: "invalid id",
        });
      }

      const article = await articles.findOne({
        _id: new ObjectId(id),
      });
      if (!article) {
        return res.status(404).json({
          message: "article not found",
        });
      }
      res.status(200).json(article);
    } catch (error) {
      console.log(error);

      res.status(500).json({
        message: "something went wrong",
      });
    }
  });

  app.put("/articles/:id", async (req, res) => {
    try {
      const id = req.params.id;

      const { title, content } = req.body;

      //checking valid id

      if (!ObjectId.isValid(id)) {
        return res.status(400).json({
          message: "invalid id",
        });
      }
      //checking data

      if (!title || !content) {
        return res.status(400).json({
          message: "title and  content require",
        });
      }

      const result = await articles.updateOne(
        {
          _id: new ObjectId(id),
        },

        {
          $set: {
            title: title,
            content: content,
          },
        },
      );

      // check whether the article exists or not

      if (result.matchedCount === 0) {
        return res.status(404).json({
          message: "article no found",
        });
      }

      res.status(200).json({
        message: "article updated",
      });
    } catch (error) {
      console.log(error);

      res.status(500).json({
        message: " something went wrong",
      });
    }
  });

  app.delete("/delete-article/:id", async (req, res) => {
    try {
      const id = req.params.id;

      //checking valid id

      if (!ObjectId.isValid(id)) {
        return res.status(400).json({
          message: " invalid  id",
        });
      }

      const result = await articles.deleteOne({
        _id: new ObjectId(id),
      });

      if (result.deletedCount === 0) {
        return res.status(404).json({
          message: " article not found",
        });
      }

      res.status(200).json({
        message: "article deleted",
      });
    } catch (error) {
      return res.status(500).json({
        message: " something went wrong",
      });
    }
  });
}
connectdb();

app.post("/articles", async (req, res) => {

  try{
  const { title, content } = req.body;

  if(!title|| !content){
    return res.status(400).json({
      message: " title and content required",
    });
  }

  const article = {
    title: title,
    content: content,
  };
  // console.log(title);

  // console.log(content);

 const result = await articles.insertOne(article);

  res.status(201).json({
    message: "article posted",
    article: {
      _id: result.insertedId,
      title: title,
      content: content,
    },
  });
}catch(error){

  console.log(error)
  return res.status(500).json({
    message: "something went wrong"
  });
}
});

app.listen(3000, () => {
  console.log("server is running on port 3000");
});
