require('dotenv').config()
const express = require('express')
var cors = require('cors')
const app = express()
const mongoClient = require('mongodb').MongoClient;
const createUserRouter = require('./helpers/create-user-router')
const createRecordRouter = require('./helpers/create-record-router')
const createChecklistRouter = require('./helpers/create-checklist-router')
const createAdminRouter = require('./helpers/create-admin-router')

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

    const checklistCollection = db.collection('checklist');
    const checklistRouter = createChecklistRouter(checklistCollection);
    app.use('/api/checklist', checklistRouter)

    const adminCollection = db.collection('admin');
    const adminRouter = createAdminRouter(adminCollection);
    app.use('/api/admin', adminRouter)

    app.listen(3001, function () {
        console.log(`Listening on port ${ this.address().port }`);
    });
  })