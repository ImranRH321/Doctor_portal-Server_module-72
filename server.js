const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ConnectionCheckOutStartedEvent } = require("mongodb");
require("dotenv").config();
const jwt = require('jsonwebtoken');

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
    const userCollection = client.db("doctor_portal").collection("users");

    // running ------>
    app.get("/service", async (req, res) => {
      const services = await serviceCollection.find({}).toArray();
      res.send(services);
    });

    /* booking  */
    app.get("/booking", async (req, res) => {
      const patient = req.query.patient;
      const query = { patient: patient };
      const booking = await bookingCollection.find(query).toArray();
      res.send(booking);
    });
   
    app.put('/user/:email', async (req, res)  => {
      const email = req.params.email;
      console.log('email', email);
      const user = req.body;
      console.log('user', user);
      const filter = {email: email};
      const option = {upsert: true}
      const updateDoc = {
        $set: user
      }
      const result = await userCollection.updateOne(filter, updateDoc, option)
      const token = jwt.sign({email: email}, process.env.ACCESS_TOKEN,  { expiresIn: '6h' })
     res.send({result, token})
    })
    
    /* ..... */
    app.get("/available", async (req, res) => {
      /*
      1* booking ar service ar name ar jodi server ar name ar sate mile jay taile ei booking ta hocce ei service ar jonno 
      2*.joto gula serviceBooking ace tar modde take amra slots gula nilam :
      3*.Tumi sob gula slot take select koro jegula book ar modde nai baki soba gula
      */
      const date = req.query.date;
      const query = { date: date };
      // je tarik re booking korte chai oi sob gula  booking  nitaci
      const bookings = await bookingCollection.find(query).toArray();
      const services = await serviceCollection.find({}).toArray();
      services.forEach(service => {
        const serviceBookings = bookings.filter(
          book => book.treatment === service.name
        );
        const bookedSlot = serviceBookings.map(book => book.slot);
        const available = service.slots.filter(
          slot => !bookedSlot.includes(slot)
        );
        service.slots = available;
      });
      res.send(services);
    });

    /* .... */
    app.post("/booking", async (req, res) => {
      const user = req.body;
      const query = {
        treatment: user.treatment,
        date: user.date,
        patient: user.patient,
      };
      const exists = await bookingCollection.findOne(query);
      if (exists) {
        return res.send({ success: false, user: exists });
      }
      const result = await bookingCollection.insertOne(user);
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
