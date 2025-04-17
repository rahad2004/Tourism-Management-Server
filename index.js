const express = require("express");
require("dotenv").config();
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const e = require("express");
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const user = process.env.DB_USER;
const pass = process.env.DB_PASS;

const uri = `mongodb+srv://${user}:${pass}@cluster0.0y0cu.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const tourSpots = client.db("Tourism").collection("Tour-places");

    const countries = client.db("Tourism").collection("countries");

    //  get all coutery data

    app.get("/countries", async (req, res) => {
      const result = await countries.find().toArray();
      res.send(result);
    });

    //get one country data

    app.get("/tourists-spots/country/:country", async (req, res) => {
      const country = req.params.country;
      const query = { countryName: country };
      const spots = await tourSpots.find(query).toArray();
      if (spots.length === 0) {
        return res.send({
          success: false,
          message: "Sorry, our services are not available in this country yet.",
        });
      }

      res.send({
        success: true,
        message: `Showing tourist spots in ${country}`,
        data: spots,
      });
    });

    //get all your place

    app.get("/tourists-spots", async (req, res) => {
      const sortOrder = req.query.sort;
      const sortOption =
        sortOrder === "asc" ? 1 : sortOrder === "desc" ? -1 : 0;

      const result = await tourSpots
        .find()
        .sort(sortOption !== 0 ? { avrageCost: sortOption } : {})
        .toArray();
      res.send(result);
    });

    // get one place

    app.get("/tourists-spots/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const spot = await tourSpots.findOne(query);

      if (!spot) {
        return res
          .status(404)
          .send({ success: false, message: "Spot not found" });
      }
      res.send({
        success: true,
        message: "This the details page",
        data: spot,
      });
    });

    // adding a place

    app.post("/add-tourists-spots", async (req, res) => {
      const place = req.body;

      const exists = await tourSpots.findOne({ palceName: place.palceName });

      if (exists) {
        return res.status(409).send({
          success: false,
          message: "This palce is allready exists",
        });
      }

      const result = await tourSpots.insertOne(place);
      res.status(200).send({
        success: true,
        message: "Tourist spot added successfully!",
        data: result,
      });
    });

    // delete a place

    app.delete("/tourists-spots/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };

      const result = await tourSpots.deleteOne(query);
      if (result.deletedCount > 0) {
        res.send({
          success: true,
          message: "Tourist spot deleted successfully.",
        });
      } else {
        res.status(404),
          send({
            success: false,
            message: "Spot not found.",
          });
      }
    });

    // get my add palce
    app.get("/my-sports", async (req, res) => {
      const email = req.query.email;
      const query = { email: email };
      const spots = await tourSpots.find(query).toArray();

      if (spots.length === 0) {
        return res.status(404).send({
          success: false,
          message: "No tourist Spot Found on this user",
          data: [],
        });
      }

      res.status(200).send({
        success: true,
        message: "User-specific tourist spot fetch successFully",
        data: spots,
      });
    });

    app.put("/tourists-spots/:id", async (req, res) => {
      const id = req.params.id;
      const data = req.body;
      const query = { _id: new ObjectId(id) };
      const update = { $set: data };

      console.log(data);

      const result = await tourSpots.updateOne(query, update);

      if (result.modifiedCount > 0) {
        res.send({ success: true, message: "update successfully" });
      } else {
        res.send({ success: false, message: "spot not found" });
      }
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Express app runing on ${port}`);
});
