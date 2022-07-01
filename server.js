// const nodemailer = require('nodemailer')
require('dotenv').config()
const Parse = require('parse/node');

Parse.initialize(process.env.APP_ID, process.env.JS_KEY); //PASTE HERE YOUR Back4App APPLICATION ID AND YOUR JavaScript KEY
Parse.serverURL = 'https://parseapi.back4app.com/'

//Saving your First Data Object on Back4App
async function saveNewPerson() {
    const person = new Parse.Object("Person");
  
    person.set("name", "John Snow");
    person.set("age", 27);
    try {
      let result = await person.save()
      alert('New object created with objectId: ' + result.id);
    } catch(error) {
        alert('Failed to create new object, with error code: ' + error.message);
    }
} 

//Reading your First Data Object from Back4App
async function retrievePerson() {
    const query = new Parse.Query("Person");

    try {
        const person = await query.get("eRYHrDBwND");
        const name = person.get("name");
        const age = person.get("age");

        alert(`Name: ${name} age: ${age}`);
    } catch (error) {
        alert(`Failed to retrieve the object, with error code: ${error.message}`);
    }
}  

// const smtpTransport = nodemailer.createTransport({
//     host: 'gmail'
// })


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


    const port = process.env.PORT || 3001;
    app.listen(port, function () {
        console.log(`Listening on port ${ this.address().port }`);
    });
  })