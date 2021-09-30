const express = require('express')
const app = express()
const mongoClient = require('mongodb').MongoClient;
const bcrypt = require('bcrypt')
const createRouter = require('./helpers/create-router.js')

app.use(express.json())


const url = 'mongodb://localhost:27017'
mongoClient.connect(url, {useNewUrlParser: true, useUnifiedTopology: true}
    , (error, client) =>{
    if (error) 
        console.log("Can't connect to the database")

    const db = client.db('rickshaw'); // dummy data in seeds.js 
    const definitionsCollection = db.collection('users'); // essentially a collection is a table

    const definitionsRouter = createRouter(definitionsCollection);
    app.use('/api/users/', definitionsRouter); 
    
    //here comes all our routes

    app.listen(3001, function () {
        console.log(`Listening on port ${ this.address().port }`);
    });
  })





// const users = []

// app.get('/users', (req, res) => {
//     res.json(users)
// })

// app.post('/users', async (req, res) => {
//     try {
//         const hashedPassword = await bcrypt.hash(req.body.password, 10)
//         const user = {
//             name: req.body.name,
//             password: hashedPassword
//         }
//         users.push(user)
//         res.status(201).send()
//     } catch {
//         res.status(500).send()
//     }
// })

// app.post('/users/login', async (req, res) => {
//     const user = users.find(user => user.name === req.body.name)
//     if (user == null) {
//         return res.status(400).send('Cannot find user')
//     }
//     try {
//         if (await bcrypt.compare(req.body.password, user.password)) {
//             res.send('Success')
//         } else {
//             res.send('Not Allowed')
//         }
//     } catch {
//         res.status(500).send()
//     }
// })

// app.listen(3001)