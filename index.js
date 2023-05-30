const express = require("express");
require("dotenv").config();
const cors = require("cors");
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
// const uri = "mongodb://localhost:27017";

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.aozzirl.mongodb.net/?retryWrites=true&w=majority`;


// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
  useNewUrlParser: true,
  useUnifiedTopology: true,
  maxPoolSize: 10,
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // client.connect()
    client.connect((error) => {
      if (error) {
        console.error(error);
        return;
      }
    });

    const productCollections = client.db("theToy").collection("AllToys");

    // const indexKeys = { name: 1 };
    // const indexOptions = { name: "price" };
    // productCollections.createIndex(indexKeys, indexOptions);

    app.get("/alltoys", async (req, res) => {
      let query = {};
      if (req.query?.email) {
        query = {
          email: req.query.email,
        };
      }
      const result = await productCollections
        .find(query)
        .sort({ price: 1 })
        .limit(20)
        .toArray();
      res.send(result);
    });

    app.get('/categories', async(req,res)=>{
      const category = req.query.category

      const query = { subCategory: category };
      const result = await productCollections.find(query).toArray()
      res.send(result)
    })

    app.get("/toySearchByName/:text", async (req, res) => {
      const searchToy = req.params.text;
      const result = await productCollections
        .find({ name: { $regex: searchToy, $options: "i" } })
        .toArray();
      res.send(result);
    });

    

    app.get('/alltoys/:id', async(req,res)=>{
      const id = req.params.id
      const query = { _id: new ObjectId(id) };
      const result = await productCollections.findOne(query)
      res.send(result)
    })


   

    app.post("/addtoy", async (req, res) => {
      const body = req.body;
      const result = await productCollections.insertOne(body);
      res.send(result);
    });

    app.put("/alltoys/:id", async(req, res) => {
      const id = req.params.id;
      
      const filter = { _id: new ObjectId(id) };
      const option = { upsert: true };

      const updatedMyToy = req.body;
      
      const updateDoc = {
        $set: {
          price: updatedMyToy.price,
          availableQuantity: updatedMyToy.availableQuantity,
          details: updatedMyToy.details,
        },
      };
      const result = await productCollections.updateOne(filter, updateDoc, option);
      res.send(result);
    });

    app.delete("/alltoys/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await productCollections.deleteOne(query);
      res.send(result);
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
  res.send("the toy is comming ");
});

app.listen(port, () => {
  console.log(`the toy is running : ${port}`);
});
