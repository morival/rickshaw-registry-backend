const express = require('express');
const ObjectID = require('mongodb').ObjectId;
const bcrypt = require('bcrypt')

const createRecordRouter = function(collection) {
    
    const router = express.Router();
    
    
    // //   AUTHENTIFICATE
    // router.post('/login', async (req, res) => {
    //     try {
    //         const data = req.body
    //         const login = data.login
    //         // console.log(data)
    //         const user = (await collection.find().toArray()).find(user => user.email === login || user.phoneNumber === login || user._id.toString() == login)
    //         // const user = await collection.findOne({ 
    //         //     $or: [
    //         //          {email: login}, {phoneNumber: login}, { _id: ObjectID(login) }
    //         //     ]
    //         // })
    //         console.log(user)
    //         if (user === undefined)
    //             res.status(404).json({ code: "userLogin", message: "Cannot find user" })
    //         else if (await bcrypt.compare(data.password, user.password))
    //             // res.json(user)
    //             res.json({ id: user._id, message: "Authentification Success" })
    //         else 
    //         res.status(401).json({ code: "password", message: "Incorrect Password" })
    //     } catch (err) {
    //         res.status(500).json({ message: err.message })
    //     }
    // });


    //   GET ALL
    router.get('/', async (req, res) => {
        try {
            const data = await collection.find().toArray()
            res.json(data)
        } catch (err) {
            res.status(500).json({ message: err.message})
        }
    });


    //   GET ONE
    router.get("/:id", async (req, res) => {
        const id = req.params.id;
        try {
            const record = await collection.findOne({ _id: ObjectID(id) })
            console.log(record)
            delete record.password
            res.status(200).json(record)
        } catch {
            res.status(404).json({ message: "Cannot find record"})
        }
    })


    //   CREATE ONE
    router.post('/', async (req, res) => {
        const record = req.body
        console.log(record)
        try {
            await collection.insertOne(record)
            res.status(201).json(record)
        } catch (err) {
            res.status(500).json({ message: err.message })
        }
    });


    //   UPDATE ONE
    // router.put('/:id', async (req, res) => {
    //     try {
    //         const data = req.body
    //         const id = req.params.id;
    //         delete data._id;
    //         if (data.password) {
    //             const hashedPassword = await bcrypt.hash(data.password, 10)
    //             data.password = hashedPassword
    //         }
    //         console.log(data)
    //                 await collection.findOneAndUpdate({ _id: ObjectID(id) },{ $set: data },{returnOriginal: false});
    //                 const user = await collection.findOne({ _id: ObjectID(id) })
    //                 delete user.password
    //                 res.status(200).json(user)
    //     } catch (err) {
    //         res.status(500).json({ message: err.message })
    //     }
    // });


    //   DELETE ONE
    router.delete('/:id', async (req, res) => {
        const id = req.params.id;
        const record = await collection.findOne({ _id: ObjectID(id) })
        if (record === null)
            res.status(404).json({ message: "Cannot find record" })
        try {
            const deleteAction = await collection.deleteOne({ _id: ObjectID(id) })
            console.log(deleteAction)
            res.status(200).json({ code: "record", message: `Deleted ${record._id}` })
        } catch (err) {
            res.status(500).json({ message: err.message })
        }
    });
    

    return router; 
};

module.exports = createRecordRouter;
