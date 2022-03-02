require('dotenv').config()
const express = require('express')
var cors = require('cors')
const app = express()
const mongoClient = require('mongodb').MongoClient;
const createUserRouter = require('./helpers/create-user-router')
const createRecordRouter = require('./helpers/create-record-router')

app.use(express.json())
app.use(cors())


const url = process.env.DATABASE_URL

mongoClient.connect(url, {useNewUrlParser: true, useUnifiedTopology: true}
    , (error, client) => {
    if (error) 
        console.log("Can't connect to the database: "+error)

    const db = client.db('rickshaw');

    const usersCollection = db.collection('users');
    const usersRouter = createUserRouter(usersCollection);
    app.use('/api/users', usersRouter);
    
    const recordsCollection = db.collection('records');
    const recordsRouter = createRecordRouter(recordsCollection);
    app.use('/api/records', recordsRouter)

    app.listen(3001, function () {
        console.log(`Listening on port ${ this.address().port }`);
    });
  })