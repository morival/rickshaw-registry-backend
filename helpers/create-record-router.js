const express = require('express');
const ObjectID = require('mongodb').ObjectId;
const bcrypt = require('bcrypt')

const createRecordRouter = function(collection) {
    
    const router = express.Router();
    

    //  GET ALL
    router.get('/', async (req, res) => {
        try {
            const data = await collection.find().toArray()
            res.json(data)
        } catch (err) {
            res.status(500).json({ message: err.message})
        }
    });


    //  GET ALL OF USER
    router.get('/user/:userID', async (req, res) => {
        const userID = req.params.userID;
        console.log(req.params)
        try {
            const data = await collection.find({ user_id: userID }).toArray()
            console.log(data)
            res.json(data)
        } catch (err) {
            res.status(500).json({ message: err.message})
        }
    })


    //  GET ONE
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


    //  CREATE ONE
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


    //  UPDATE ONE


    //  DELETE ONE
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


    //  DELETE ALL OF USER
    router.delete('/user/:userID', async (req, res) => {
        const userID = req.params.userID;
        console.log(req.params)
        try {
            const deleteAction = await collection.deleteMany({ user_id: userID })
            console.log(deleteAction)
            res.status(200).json({ code: "record", message: `All records related to ${userID} user_id have been deleted` })
        } catch (err) {
            res.status(500).json({ message: err.message })
        }
    })
    

    return router; 
};

module.exports = createRecordRouter;
