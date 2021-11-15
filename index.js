const express = require('express');
const app = express();
const port = process.env.PORT || 5000;
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;
require('dotenv').config();
const cors = require('cors');




// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.a6jam.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {
      await client.connect();
      const database = client.db("car_sales");
      const carsCollection = database.collection("cars");
      const usersCollection = database.collection("users");
      const ordersCollection = database.collection("orders");
      const reviewsCollection = database.collection("reviews");
       
      // show cars in ui
      app.get('/cars',  async (req, res)=>{
        const crusor = carsCollection.find({});
        const result = await crusor.toArray();
        res.send(result);
      })

       // get car details based on orderId
       app.get('/cars/car',  async (req, res)=>{
        const orderId = req.query.orderId;
        const query = {_id: ObjectId(orderId)};
        const order = await carsCollection.findOne(query);
        res.send(order);
      })

       // get specific car for purchase
       app.get('/cars/:carId',  async (req, res)=>{
        const carId = req.params.carId;
        const query = { _id: ObjectId(carId) };
        const car = await carsCollection.findOne(query);
        res.send(car);
      })

      // get users for check is admin or not
      app.get('/users/:email',  async (req, res)=>{
        const userEmail = req.params.email;
        const query = { email: userEmail };
        const user = await usersCollection.findOne(query);
        let isAdmin = false;
        if(user?.role === 'admin'){
          isAdmin = true;
        }
        res.send({admin: isAdmin});
      })

      // get orders from database based on user email
      app.get('/orders/:email',  async (req,res)=>{
        const userEmail = req.params.email;
        const query = {email: userEmail};
        const cursor = ordersCollection.find(query);
        const orders = await cursor.toArray();
        res.send(orders);
      })
      
      // get all orders from database
      app.get('/orders',  async (req,res)=>{
        const cursor = ordersCollection.find({});
        const orders = await cursor.toArray();
        res.send(orders);
      })

     // get all reviews from database
     app.get('/reviews',  async (req, res)=>{
      const cursor = reviewsCollection.find({});
      const reviews = await cursor.toArray();
      res.send(reviews);
     })
      

      // save users to database
      app.post('/users',  async (req,res)=>{
          const user = req.body.user;
          const doc = user;
          const result = await usersCollection.insertOne(doc); 
          res.json(result)
      })

      // save a order to databse
      app.post('/orders',  async (req, res)=>{
        const order = req.body.bookingOrder;
        const result = await ordersCollection.insertOne(order);
        res.send(result)
      })

        // save users to database
      app.post('/cars',  async (req,res)=>{
          const car = req.body.product;
          const doc = car;
          const result = await carsCollection.insertOne(doc); 
          console.log('this is a car',car, result);
          res.json(result)
      })

      // make an admin
      app.put('/users', async (req, res)=>{
          const email = req.body.userEmail;
          const filter = email;
          const updateDoc = {
            $set: {
              role: `admin`
            },
          };
          const result = await usersCollection.updateOne(filter, updateDoc);
          res.json(result)
      })
      
      // update order status
      app.put('/orders/:id',  async (req, res)=>{
          const id = req.params.id;
          const filter = {_id: ObjectId(id)};
          const updateDoc = {
            $set: {
              orderStatus: `Shipped`
            },
          };
          const result = await ordersCollection.updateOne(filter, updateDoc);
          console.log('hitting update', result)
          res.json(result)
      })

      // set or update review to database
      app.put('/reviews/:email',  async (req, res)=>{
        const email = req.params.email;
        const review = req.body.review;
        const filter = { email: email};
        const options = { upsert: true };
        const updateDoc = {$set: review};
        const result = await reviewsCollection.updateOne(filter, updateDoc, options);
        console.log('email & body',email, review, result);
        res.json(result);
      })

      // delete specific order from database
      app.delete('/orders/:id',  async (req, res)=>{
        const id = req.params.id;
        const query = {_id: ObjectId(id)};
        const result = await ordersCollection.deleteOne(query);
        res.send(result)
      })
      // delete product
      app.delete('/cars/:id',  async (req, res)=>{
        const id = req.params.id;
        const query = {_id: ObjectId(id)};
        const result = await carsCollection.deleteOne(query);
        console.log('cars', id, result)
        res.send(result)
      })

    } finally {
    //   await client.close();
    }
  }
  run().catch(console.dir);
app.get('/', (req, res) => {
  res.send('Hello World!@@@@@')
})

app.listen(port, () => {
  console.log(`listening at:${port}`)
})

