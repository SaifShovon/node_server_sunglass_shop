const express = require('express');
require('dotenv').config();
const { MongoClient } = require('mongodb');
const cors = require('cors');
const ObjectId = require('mongodb').ObjectId;
const app = express();
const port = process.env.PORT || 5000;
app.use(cors());
app.use(express.json());
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.w8by6.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
async function run() {
    try {
        await client.connect();
        const database = client.db("sunglass_db");
        const userCollection = database.collection("users");
        const orderCollection = database.collection("orders");
        const productCollection = database.collection("products");
        const reviewCollection = database.collection("reviews");
        //get api
        app.get('/reviews', async (req, res) => {
            const cursor = reviewCollection.find({});
            const reviews = await cursor.toArray();
            res.send(reviews)
        })
        app.get('/users', async (req, res) => {
            const cursor = userCollection.find({});
            const users = await cursor.toArray();
            res.send(users)
        })

        app.get('/orders', async (req, res) => {
            const cursor = orderCollection.find({});
            const orders = await cursor.toArray();
            res.send(orders)
        })

        app.get('/products', async (req, res) => {
            const cursor = productCollection.find({});
            const products = await cursor.toArray();
            res.send(products)
        })

        app.get('/orders/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const order = await orderCollection.findOne(query);
            console.log('user id', id)
            res.send(order)
        })

        app.get('/myorders/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const cursor = await orderCollection.find(query);
            const orders = await cursor.toArray();
            console.log('email', email)
            res.send(orders)
        })
        app.get('/users/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const user = await userCollection.findOne(query);
            let isAdmin = false;
            if (user?.role === 'admin') {
                isAdmin = true;
            }
            console.log('email', email)
            res.json({ admin: isAdmin })
        })


        //post api
        // create a document to insert
        app.post('/reviews', async (req, res) => {
            const newReview = req.body;
            const result = await reviewCollection.insertOne(newReview);
            console.log('added Review', result);
            res.json(result)
        })
        app.post('/users', async (req, res) => {
            const newUser = req.body;
            const result = await userCollection.insertOne(newUser);
            console.log('got new User', req.body);
            console.log('added User', result);
            res.json(result)
        })
        app.post('/orders', async (req, res) => {
            const newOrder = req.body;
            const result = await orderCollection.insertOne(newOrder);
            console.log('got new Order', req.body);
            console.log('added Order', result);
            res.json(result)
        })
        app.post('/products', async (req, res) => {
            const newProduct = req.body;
            const result = await productCollection.insertOne(newProduct);
            console.log('got new Product', req.body);
            console.log('added Product', result);
            res.json(result)
        })

        //Update API
        app.put('/orders/:id', async (req, res) => {
            const id = req.params.id;
            const updateOrder = req.body;
            const filter = { _id: ObjectId(id) }
            const options = { upsert: true }
            const updateDoc = {
                $set: {
                    name: updateOrder.name,
                    billing_address: updateOrder.billing_address,
                    shipping_address: updateOrder.shipping_address,
                    date: updateOrder.date,
                    quantity: updateOrder.quantity
                }
            }
            const result = await orderCollection.updateOne(filter, updateDoc, options)

            console.log('update', updateDoc);
            res.json(result);
        })
        app.put('/approve_orders/:id', async (req, res) => {
            const id = req.params.id;
            const statusInfo = req.body;
            const filter = { _id: ObjectId(id) }
            const options = { upsert: true }
            const updateDoc = {
                $set: {
                    status: statusInfo.status
                }
            }
            const result = await orderCollection.updateOne(filter, updateDoc, options)

            console.log('update', updateDoc);
            res.json(result);
        })

        app.put('/users', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email }
            const options = { upsert: true }
            const updateDoc = {
                $set: user
            }
            const result = await userCollection.updateOne(filter, updateDoc, options)

            console.log('update', updateDoc);
            res.json(result);
        })
        app.put('/users/admin', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email }
            const updateDoc = {
                $set: {
                    role: 'admin'
                }
            }
            const result = await userCollection.updateOne(filter, updateDoc)
            console.log('update', updateDoc);
            res.json(result);
        })

        //delete api
        app.delete('/orders/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const result = await orderCollection.deleteOne(query);
            console.log('delete', id)
            res.json(result);
        })
        app.delete('/products/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const result = await productCollection.deleteOne(query);
            console.log('delete', id)
            res.json(result);
        })
    } finally {
        // await client.close();
    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('running');
})
app.listen(port, () => {
    console.log('Server Running!!n', port)
})