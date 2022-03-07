const express = require("express");
const app = express();
const cors = require("cors");
const mongodb = require("mongodb");
const mongoClient = mongodb.MongoClient;
const URL = "mongodb+srv://user1:12345@cluster0.c6r2o.mongodb.net/myFirstDatabase?retryWrites=true&w=majority"
// const URL = "mongodb://localhost:27017"; 
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const secret = "ZQy788RYIh";
 

app.use(express.json());
app.use(
  cors({
    origin: "*",
  })
);

let authenticate = function (req, res, next) {
  if (req.headers.authorization) {
    try {
      let result = jwt.verify(req.headers.authorization, secret);

      next();
    } catch (error) {
      res.status(401).json({ message: "Token Invalid" });
    }
  } else {
    res.status(401).json({ message: "not authorized" });
  }
};

//Register
app.post("/register", async function (req, res) {
  try {
    let connection = await mongoClient.connect(URL);
    let db = connection.db("database2");

    let salt = await bcrypt.genSalt(10);
    let hash = await bcrypt.hash(req.body.password, salt);
    req.body.password = hash;

    await db.collection("collection2").insertOne(req.body);
    connection.close();
    res.json({ message: "User Created" });
  } catch (error) {
    console.log(error);
  }
});

//login
app.post("/login", async function (req, res) {
  try {
    let connection = await mongoClient.connect(URL);
    let db = connection.db("database2");
    let user = await db
      .collection("collection2")
      .findOne({ email: req.body.email });

    if (user) {
      let passwordResult = await bcrypt.compare(
        req.body.password,
        user.password
      );
      if (passwordResult) {
        //  res.json({message : "password correct"})

        //generate token
        let token = jwt.sign({ userid: user._id }, secret, { expiresIn: "1h" });
        res.json ({ token });
        // console.log(res.json)
      } else {
        res.status(401).json({ message: "user or password doesn't match" });
      }
    } else {
      res.status(401).json({ message: "user or password doesn't match" });
    }
  } catch (error) {
    console.log(error);
  }
});



// Create URL
app.post("/createURL", async (req,res) => {
  try {
    let connection = await mongoClient.connect(URL);
    let db = connection.db("database2");
    await db.collection("collection3").insertOne({
      url: req.body.url,
      shortUrl: generateUrl()
    })
    await connection.close();
    res.json({message: "URL Added"})
    
  } catch (error) {
    console.log(error)
  }
})


// generate URL
function generateUrl(){
  var randomUrl = [];
  var characters = "abcdefghijklmnopqrstuvwxyz0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ"
  var charactersLength = characters.length;

  for(i=0; i <=5; i++){
    randomUrl += characters.charAt(Math.floor(Math.random() * charactersLength))
  }
  return randomUrl
}

// all Urls
app.get("/getUrls", async (req, res) => {
  try {
      let connection = await mongoClient.connect(URL)
      let db = connection.db("database2")
      let urls = await db.collection("collection3").find({}).toArray()
      await connection.close();
      res.json(urls)
  } catch (error) {
      console.log(error)
  }

//delete Urls
  app.delete("/url/:id" ,async (req,res) =>{
    try {
        let connection = await mongoClient.connect(URL);
        let db = connection.db("database2");
        let objId = mongodb.ObjectId(req.params.id)
        await db.collection("collection3").deleteOne({ _id: objId })
        await connection.close();
        res.json({ message: "User Deleted" })
    } catch (error) {
        
    }
})


app.get("/dashboard", authenticate, function (req, res) {
    res.json({ totalusers: 50 })
})




})

app.listen(process.env.PORT || 3000);
