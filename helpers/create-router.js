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
        try {
            // const data = await collection.find().toArray()
            const hashedPassword = await bcrypt.hash(req.body.password, 10)
            const user = {
                name: req.body.name,
                email: req.body.email,
                phoneNumber: req.body.phoneNumber,
                password: hashedPassword,
                registerDate: req.body.registerDate
            }
            const testEmail = await collection.findOne({ email: user.email })
            const testPhoneNumber = await collection.findOne({ phoneNumber: user.phoneNumber })
            if (testEmail === null) {
                if (testPhoneNumber === null) {
                    collection.insertOne(user)
                    res.json({ message: `Added new user: ${user.name}` })
                } else {
                    res.json({ message: `${testPhoneNumber.phoneNumber} phone number already exists` })
                }
            } else {
                res.json({ message: `${testEmail.email} email already exists` })
            }
            
        } catch(err) {
            res.status(400).json({ message: err.message })
        }
    });


    //   UPDATE ONE
    router.put('/:id', async (req, res) => {
        const id = req.params.id;
        const user = await collection.findOne({ _id: ObjectID(id) })
        const hashedPassword = await bcrypt.hash(req.body.password, 10)
        const updatedData = {
            name: req.body.name,
            password: hashedPassword
        }
        try {
            collection.findOneAndUpdate(
                { _id: ObjectID(id) }, 
                { $set: updatedData }, 
                {returnOriginal: false});
            const newUser = await collection.findOne({ _id: ObjectID(id) })
            // res.send(newUser.name)
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
        const data = await collection.find().toArray()
        const user = data.find(user => user.email === req.body.login || user.phoneNumber === req.body.login)
        // console.log(user)
        try {
            if (user === undefined)
                res.status(404).json({ message: "Cannot find user" })
            else if (await bcrypt.compare(req.body.password, user.password))
                res.json(
                    // user
                    { message: "Success" }
                    )
            else 
                res.status(401).json({ message: "Not Allowed" })
        } catch(err) {
            res.status(500).json({ message: err.message })
        }
    });

    return router; 
};

module.exports = createRouter;
