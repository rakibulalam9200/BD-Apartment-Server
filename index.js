const express = require("express");
require("dotenv").config();
const { MongoClient } = require("mongodb");
const ObjectId = require("mongodb").ObjectId;
const cors = require("cors");
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.b8tdq.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function run() {
  try {
    await client.connect();
    const database = client.db("bd-apartments");
    const apartmentsCollection = database.collection("apartments");
    const bookedCollection = database.collection("booked");
    const usersCollection = database.collection("users");
    const reviewCollection = database.collection("reviews");

    //GET ALL APARTMENTS
    app.get("/apartments", async (req, res) => {
      const cursor = apartmentsCollection.find({});
      const apartments = await cursor.toArray();
      res.send(apartments);
    });

    //DELETE AN APARTMENT
    app.delete("/apartments/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await apartmentsCollection.deleteOne(query);
      res.json(result);
    });
    //GET ALL REVIEWS
    app.get("/reviews", async (req, res) => {
      const cursor = reviewCollection.find({});
      const reviews = await cursor.toArray();
      res.send(reviews);
    });

    //GET SINGLE APARTMENT
    app.get("/apartments/:id", async (req, res) => {
      const id = req.params.id;
      console.log(id);
      const query = { _id: ObjectId(id) };
      const result = await apartmentsCollection.findOne(query);
      res.json(result);
    });

    // POST to BOOK APARTMENT
    app.post("/book", async (req, res) => {
      const bookedApartment = req.body;
      const result = await bookedCollection.insertOne(bookedApartment);
      res.json(result);
    });

    // GET SINGLE USER DATA TO Check Admin or not
    app.get("/users/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const user = await usersCollection.findOne(query);
      let isAdmin = false;
      if (user?.role === "admin") {
        isAdmin = true;
      }
      res.json({ admin: isAdmin });
    });

    // POST to USER DATA
    app.post("/users", async (req, res) => {
      const user = req.body;
      const result = await usersCollection.insertOne(user);
      res.json(result);
    });

    app.put("/users", async (req, res) => {
      const user = req.body;
      const filter = { email: user.email };
      const options = { upsert: true };
      const updateDoc = { $set: user };
      const result = await usersCollection.updateOne(
        filter,
        updateDoc,
        options
      );
      res.json(result);
    });

    // UPDATE ADMIN ROLE TO USER
    app.put("/users/admin", async (req, res) => {
      const user = req.body;
      const filter = { email: user.email };
      const updateDoc = { $set: { role: "admin" } };
      const result = await usersCollection.updateOne(filter, updateDoc);
      res.json(result);
    });

    // GET  BOOKED APARTMENT BY USER
    app.get("/booking", async (req, res) => {
      const email = req.query.email;
      const query = { email: email };
      const cursor = bookedCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    });

    // GET  ALL BOOKED APARTMENT FOR ADMIN
    app.get("/allBooking", async (req, res) => {
      const cursor = bookedCollection.find({});
      const result = await cursor.toArray();
      res.send(result);
    });

    // POST A APARTMENT
    app.post("/addApartment", async (req, res) => {
      const apartment = req.body;
      const result = await apartmentsCollection.insertOne(apartment);
      res.json(result);
    });

    // POST A REVIEW
    app.post("/addReview", async (req, res) => {
      const review = req.body;
      const result = await reviewCollection.insertOne(review);
      console.log(result);
      res.json(result);
    });

    //DELETE BOOKED APARTMENT BY USER
    app.delete("/booking/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await bookedCollection.deleteOne(query);
      res.json(result);
    });

    app.put("/updateBooking/:id", async (req, res) => {
      const id = req.params.id;
      const updateStatus = req.body.status;
      console.log(updateStatus);
      const filter = { _id: ObjectId(id) };
      const options = { upsert: true };
      const updatedStatus = {
        $set: {
          status: updateStatus,
        },
      };
      const result = await bookedCollection.updateOne(
        filter,
        updatedStatus,
        options
      );
    });

    //UPDATE API
    app.put("/apartments/:id", async (req, res) => {
      const id = req.params.id;
      const updateApartment = req.body;
      const filter = { _id: ObjectId(id) };
      const options = { upsert: true };
      const updatedApartment = {
        $set: {
          name: updateApartment.name,
          features: updateApartment.features,
          price: updateApartment.price,
          location: updateApartment.location,
          des: updateApartment.des,
          img: updateApartment.img,
        },
      };
      const result = await apartmentsCollection.updateOne(
        filter,
        updatedApartment,
        options
      );

      res.json(result);
    });
  } finally {
    //await client.close();
  }
}

run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Start Bd Apartment Server");
});

app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}`);
});
