const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const port = 5000;

app.use(cors());
app.use(express.json());

const uri =
  "mongodb+srv://rahadmondal165:xgN2AK7Eat2l4peG@cluster0.0y0cu.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

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
      console.log("Requested ID:", id);

      try {
        const query = { _id: new ObjectId(id) };
        const spot = await tourSpots.findOne(query);

        if (!spot) {
          return res
            .status(404)
            .send({ success: false, message: "Spot not found" });
        }

        res.send(spot);
      } catch (error) {
        console.error("Error fetching spot:", error);
        res
          .status(500)
          .send({ success: false, message: "Internal server error" });
      }
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
      res.send({
        success: true,
        message: "Tourist spot added successfully!",
        data: result,
      });
    });

    // get my add palce

    app.get("/my-sports", async (req, res) => {
      const email = req.query.email;
      console.log(email);
      const query = { email: email };

      const spots = await tourSpots.find(query).toArray();
      console.log(spots);

      res.send(spots);
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
