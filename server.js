require('dotenv').config()
const express = require('express')
var cors = require('cors')
const app = express()
const mongoClient = require('mongodb').MongoClient;
const createRouter = require('./helpers/create-router')

app.use(express.json())
app.use(cors())


const url = process.env.DATABASE_URL

mongoClient.connect(url, {useNewUrlParser: true, useUnifiedTopology: true}
    , (error, client) => {
    if (error) 
        console.log("Can't connect to the database")

    const db = client.db('rickshaw');
    const definitionsCollection = db.collection('users');

    const definitionsRouter = createRouter(definitionsCollection);
    app.use('/api/users', definitionsRouter);

    app.listen(3001, function () {
        console.log(`Listening on port ${ this.address().port }`);
    });
  })