const express = require('express');
const ObjectID = require('mongodb').ObjectId;
const bcrypt = require('bcrypt')

const createRouter = function(collection) {

    const router = express.Router();

    //   GET ALL
    router.get('/', async (req, res) => {
        try {
            const data = await collection.find().toArray()
            res.json(data)
        } catch(err) {
            res.status(500).json({ message: err.message})
        }
    });

    //   GET ONE
    router.get("/:id", async (req, res) => {
        const id = req.params.id;
        try {
            const user = await collection.findOne({ _id: ObjectID(id) })
            res.send(user)
        } catch {
            res.status(404).json({ message: "Cannot find user"})
        }
    })

    //   CREATE ONE
    router.post('/', async (req, res) => {
        // const data = await collection.find().toArray()
        try {
            const hashedPassword = await bcrypt.hash(req.body.password, 10)
            const user = {
                name: req.body.name,
                email: req.body.email,
                phoneNumber: req.body.phoneNumber,
                password: hashedPassword,
                registerDate: req.body.registerDate
            }
            // console.log(user)
            const testEmail = await collection.findOne({ email: user.email })
            const testPhoneNumber = await collection.findOne({ phoneNumber: user.phoneNumber })
            if (!testEmail && !testPhoneNumber) {
                    collection.insertOne(user)
                    res.status(201).json(user)
            } else if (testEmail) {
                res.status(409).json({ code: "email", message: "The email already exists" })
            } else if (testPhoneNumber) {
                    res.status(409).json({ code: "phoneNumber", message: "The phone number already exists" })
            }
        } catch(err) {
            res.status(400).json({ message: err.message })
        }
    });


    //   UPDATE ONE
    router.put('/:id', async (req, res) => {
        const id = req.params.id;
        const user = await collection.findOne({ _id: ObjectID(id) })
        // const hashedPassword = await bcrypt.hash(req.body.password, 10)
        delete req.body._id;
        const data = req.body
        console.log(data)
        // const updateData = () => {
        //     Object.entries(data).forEach(([key, value]) => {
        //         console.log(`${key}: ${value}`)
        //     })
        // }
        // console.log(updateData)
        // const updatedData = {
        //     name: req.body.name,
        //     email: req.body.email,
        //     phoneNumber: req.body.phoneNumber,
        //     address: req.body.address,
        //     dOB: req.body.dOB,
        //     password: hashedPassword
        // }
        try {
            collection.findOneAndUpdate({ _id: ObjectID(id) },{ $set: data },{returnOriginal: false});
            const newUser = await collection.findOne({ _id: ObjectID(id) })
            res.json({ message: `${user.name} user has been updated to ${newUser.name}` })
        } catch {
            res.status(404).json({ message: "Cannot find user" })
        }
    });

    //   DELETE ONE
    router.delete('/:id', async (req, res) => {
        const id = req.params.id;
        const user = await collection.findOne({ _id: ObjectID(id) })
        if (user === null)
            res.status(404).json({ message: "Cannot find user" })
        try {
            await collection.deleteOne({ _id: ObjectID(id) })
            res.json({ message: `Deleted ${user.name}` })
        } catch(err) {
            res.status(500).json({ message: err.message })
        }
    });
    
    //   AUTHENTIFICATE
    router.post('/login', async (req, res) => {
        try {
            const login = req.body.login
            const data = await collection.find().toArray()
            const user = data.find(user => user.email === login || user.phoneNumber === login || user._id.toString() == login)
            // console.log(user)
            if (user === undefined)
                res.status(404).json({ code: "userLogin", message: "Cannot find user" })
            else if (await bcrypt.compare(req.body.password, user.password))
                res.json(user)
            else 
            res.status(401).json({ code: "password", message: "Incorrect Password" })
        } catch(err) {
            res.status(500).json({ message: err.message })
        }
    });

    return router; 
};

module.exports = createRouter;
