const express = require("express");
require("dotenv").config();
const cors = require("cors");
const { MongoClient } = require("mongodb");

const app = express();
app.use(cors());
app.use(express.json());
const port = process.env.PORT || 5000;
const objectId = require('mongodb').ObjectId;

// uri and client for mongoDB 
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.terls.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const run = async () => {
  try {
    await client.connect();
    const database = client.db("liveAfrica");
    const offersCollection = database.collection("offers");
    const ordersCollection = database.collection("orders");
    const contactsCollection = database.collection("contacts");

    // Get all the offers 
    app.get("/offers", async (req, res) => {
      const allOffers = await offersCollection.find({});
      const convertedOffers = await allOffers.toArray();
      res.json(convertedOffers);
    });
    // Insert new offer 
    app.post('/offers', async (req,res)=> {
      const data = req.body;
      const result = await offersCollection.insertOne(data);
      res.json({res: 'true'});
    })
    // Delete an offer 
    app.delete('/offers/:id',async (req,res)=> {
      const id = req.params.id;
      const result = await offersCollection.deleteOne({_id:objectId(id)});
      res.json({res: ' '});
    })
    // Get clicked offer 
    app.get('/offers/:id',async (req,res)=> {
      const id = req.params.id;
      const searchedOffer = await offersCollection.findOne({_id:objectId(id)});
      res.json(searchedOffer);
    })
    // Insert new booking 
    app.post('/booked', async (req,res)=> {
      const data = req.body;
      const result = await ordersCollection.insertOne(data);
      res.json(result.acknowledged);
    })
    // Delete a booking 
    app.delete('/booked', async(req,res)=> {
      const deleteId = req.body.deleteId;
      const result = await ordersCollection.deleteOne({_id:objectId(deleteId)});
      res.json({res:' '})
    })
    // Update a booking by admin 
    app.put('/booked', async (req,res)=> {
      const updateId = req.body.updateId;
      const status = req.body.status;
      const filter = { _id: objectId(updateId)};
      const options = { upsert: true };
      const updateDoc = {
        $set: {
          status: status
        },
      };
      const result = await ordersCollection.updateOne(filter, updateDoc, options);
      res.json({res:' '});
    })
    //check booked item
    app.get('/booked', async(req,res)=> {
      const userEmail = req.query.userEmail;
      const id = req.query.id;
      if(userEmail!=undefined && id!=='undefined') {
        const result = await ordersCollection.findOne({userEmail:userEmail,id:id});
        if(result) res.json({res:' '});
        else res.json({res: ''});
      }
    })
    // Get my orders 
    app.get('/allBookings/:userEmail', async (req,res)=> {
      const userEmail = req.params.userEmail;
      const result = await ordersCollection.find({userEmail:userEmail});
      const convertedOrders = await result.toArray();
      res.json(convertedOrders);
    })
    // Get all orders 
    app.get('/allBookings', async (req,res)=> {
      const result = await ordersCollection.find({});
      const convertedOrders = await result.toArray();
      res.json(convertedOrders);
    })
    // Post message 
    app.post('/contact',async (req,res)=> {
      const contactData = req.body;
      const result = await contactsCollection.insertOne(contactData);
      res.json({res: ' '});
    })
  } finally {
    // client.close();
  }
};
run().catch(console.dir);
// Home page for node server
app.get("/", (req, res) => {
  res.send("Hello from server");
});
//   Listening at port
app.listen(port, () => {
  console.log("listening", port);
});
