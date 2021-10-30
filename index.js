const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
require("dotenv").config();
const MongoClient = require("mongodb").MongoClient;
const ObjectId = require("mongodb").ObjectId;
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.terls.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;


const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const port = 5000;
const app = express();
app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send("Hello World!");
});

  //  make route and get data
async function run() {
  try {
    
    await client.connect()
      const servicesCollection = client.db("liveAfrica").collection("services");
      const ordersCollection = client.db("liveAfrica").collection("orders");
    ;
    app.get("/services", async (req, res) => {
    servicesCollection.find({}).toArray((err, results) => {
      res.send(results);
    });
  });

  // get single service

  app.get("/singleService/:id", (req, res) => {
    console.log(req.params.id);
    servicesCollection
      .find({ _id: ObjectId(req.params.id) })
      .toArray((err, results) => {
        res.send(results[0]);
      });
  });
  //add Service
  app.post("/addServices", (req, res) => {
    console.log(req.body);
    servicesCollection.insertOne(req.body).then((documents) => {
      res.send(documents.insertedId);
      console.log(documents);
    });
  });

  //delete services from the database
  // app.delete("/deleteService/:id", async (req, res) => {
  //   console.log(req.params.id);

  //   ordersCollection
  //     .deleteOne({ _id: ObjectId(req.params.id) })
  //     .then((result) => {
  //       res.send(result);
  //     });
  // });
  app.delete("/services/:id", async (req, res) => {
    const id = req.params.id;
    const query = { _id: ObjectId(id) };
    const result = await servicesCollection.deleteOne(query);
    res.json(result);
  });
  app.delete("/servicesOrders/:id", async (req, res) => {
    const id = req.params.id;
    const query = { _id: ObjectId(id) };
    const result = await ordersCollection.deleteOne(query);
    res.json(result);
  });

  //update product
  app.put("/update/:id", async (req, res) => {
    const id = req.params.id;
    const updatedInfo = req.body;
    const filter = { _id: ObjectId(id) };

    servicesCollection
      .updateOne(filter, {
        $set: {
          name: updatedInfo.name,
          price: updatedInfo.price,
          description: updatedInfo.description,
        },
      })
      .then((result) => {
        res.send(result);
      });
  });

  //add order in database

  app.post("/addOrders", (req, res) => {
    ordersCollection.insertOne(req.body).then((result) => {
      res.send(result);
    });
  });

  // get all order by email query
  app.get("/myOrders/:email", (req, res) => {
    console.log(req.params);
    ordersCollection
      .find({ email: req.params.email })
      .toArray((err, results) => {
        res.send(results);
      });
  });
} finally {
  //   await client.close();
}
}
run().catch(console.dir);

app.listen(process.env.PORT || port);
