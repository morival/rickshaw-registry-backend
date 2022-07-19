const express = require('express');
const ObjectID = require('mongodb').ObjectId;
const bcrypt = require('bcrypt')

const createChecklistRouter = function(collection) {

    const router = express.Router();

    
    //  GET ALL
    router.get('/', async (req, res) => {
        try {
            const data = await collection.find().toArray();
            res.json(data)
        } catch (err) {
            res.status(500).json({ message: err.message})
        }
    });


    //  CREATE ONE
    router.post('/', async (req, res) => {
        const data = {
            description: req.body.description,
            status: "",
            comments: ""
        }
        try {
            await collection.insertOne(data)
            res.status(201).json(data)
        } catch (err) {
            res.status(500).json({ message: err.message })
        }
    })


    //  UPDATE ONE
    router.patch('/:id', async (req, res) => {
        const data = {description: req.body.description};
        console.log(data)
        const id = req.params.id;
        try {
            await collection.findOneAndUpdate({ _id: ObjectID(id) },{ $set: data })
            const updatedDescription = await collection.findOne({ _id: ObjectID(id) })
            res.status(200).json(updatedDescription)
        } catch (err) {
            res.status(500).json({ message: err.message })
        }
    })


    //  DELETE ONE
    router.delete('/:id', async (req, res) => {
        const id = req.params.id;
        const description = await collection.findOne({ _id: ObjectID(id) })
        if (description === null)
            res.status(404).json({ message: "Cannot find description" })
        try {
            const del = await collection.deleteOne({ _id: ObjectID(id) })
            console.log(del)
            res.status(200).json({ code: "description", message: `Deleted description: ${description.description}` })
        } catch (err) {
            res.status(500).json({ message: err.message })
        }
    });


    // DELETE MANY
    router.delete('/', async (req, res) => {
        const ids = req.body.map(id => new ObjectID(id))
        const query = { _id: { $in: ids } };
        try {
            const del = await collection.deleteMany(query)
            res.status(200).json({ code: "descriptions", message: `Deleted ${del.deletedCount} description${del.deletedCount > 1 ? "s": ""}` })
        } catch (err) {
            res.status(500).json({ message: err.message })
        }
    });


    return router;
}

module.exports = createChecklistRouter;