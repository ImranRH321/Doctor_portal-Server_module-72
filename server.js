const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion } = require("mongodb");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.l7pdx.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

async function run() {
  try {
    await client.connect();
    const serviceCollection = client.db("doctor_portal").collection("service");
    const bookingCollection = client.db("doctor_portal").collection("booking");

    //    service load data
    app.get("/service", async (req, res) => {
      const result = await serviceCollection.find({}).toArray();
      res.send(result);
    });

    /**
     * api naming convention
     * app.get('/booking')  // get all  bookings this collection . and get items  one this filter collection
     * app.get('/booking'/:id) // get a specific booking
     * app.post('/booking') // add  new booking
     * app.fetch(/booking/:id)
     * app.delete(/booking/:d)
     */

    // };
    app.post("/booking", async (req, res) => {
      const booking = req.body;
      console.log(booking);
      const query = {
        treatment: booking.treatment,
        date: booking.date,
        patient: booking.patient,
      };

      const exists = await bookingCollection.findOne(query);
      if (exists) {
        return res.send({ success: false, booking: exists });
      }
      const result = await bookingCollection.insertOne(booking);
      return res.send({ success: true, result });
    });
  } finally {
    // client.close()
  }
}
run().catch(console.log);

app.get("/", (req, res) => {
  res.send("Doctor Portal Server is Running ");
});

app.listen(port, () => {
  console.log("server is running port --->", port);
});
