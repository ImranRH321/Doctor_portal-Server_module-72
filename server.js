const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config()

const app = express()
const port = process.env.PORT || 5000

// middleware 
app.use(cors())
app.use(express.json())


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.l7pdx.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run (){
  try{
   await client.connect()
   const serviceCollection =  client.db('doctor_portal').collection('service')
 
//    service load data
   app.get('/service', async (req, res) => {
     const result = await serviceCollection.find({}).toArray()
     res.send(result)
   })

  }
  finally{
    // client.close()
  }
}
run().catch(console.log)

app.get('/', (req, res) => {
    res.send('Doctor Portal Server is Running ')
})


app.listen(port, () => {
    console.log('server is running port --->', port);
})