const express = require('express');
const ObjectID = require('mongodb').ObjectId;
const bcrypt = require('bcrypt')

const createRouter = function(collection) {

  const router = express.Router();

//   GET ALL
  router.get('/', async (req, res) => {
    const data = await collection.find().toArray()
    try {
        res.json(data)
    } catch(err) {
        res.status(500).json({ message: err.message})
    }
  });

//   GET ONE
  router.get('/:id', async (req, res) => {
    //   res.send(res.user.name)
    const data = await collection.find().toArray()
    const id = req.params.id;
    try {
        if (await data.findOne({ _id: ObjectID(id)}))
        res.send(data)
    } catch(err) {
        res.status(500).json({ message: err.message})
    }
    // collection
    // .findOne({ _id: ObjectID(id) })
    // .then((doc) => res.json(doc))
    // .catch((err) => {
    //   console.error(err);
    //   res.status(500);
    //   res.json({ status: 500, error: err });
    // });
  })

//   CREATE ONE
  router.post('/', async (req, res) => {
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10)
        const user = {
            name: req.body.name,
            password: hashedPassword
        }
        collection
        .insertOne(user)
        res.status(201).send()
        console.log("Added new user:", user.name)
    } catch {
        res.status(400).send()
    }
  });

//   AUTHENTIFICATE
  router.post('/login', async (req, res) => {
    const data = await collection.find().toArray()
    const user = data.find(user => user.name === req.body.name)
    if (user == null)
        res.status(400).send('Cannot find user')
    try {
        if (await bcrypt.compare(req.body.password, user.password)) 
            res.send('Success')
        else 
            res.send('Not Allowed')
    } catch {
        res.status(500).send()
    }
  });

//   UPDATE ONE
  router.put('/:id', async (req, res) => {
    try {
        const data = await collection.find().toArray()
        const id = req.params.id;
        const updatedData = req.body;
        console.log(updatedData)
        delete updatedData._id;
        data.findOneAndUpdate({ _id: ObjectID(id) }, { $set: updatedData })
        res.json(data.value)
    } catch {
        res.status(500).send()
    }
    // collection
    // .findOneAndUpdate({ _id: ObjectID(id) }, { $set: updatedData })
    // .then(result => {
    //   res.json(result.value);
    // })
    // .catch((err) => {
    //   res.status(500);
    //   res.json({ status: 500, error: err });
    // });
  });

//   DELETE ONE
  router.delete('/:id', (req, res) => {
    const id = req.params.id;
    collection
    .deleteOne({ _id: ObjectID(id) })
    .then(result => {
      res.json(result);
    })
    .catch((err) => {
      console.error(err);
      res.status(500);
      res.json({ status: 500, error: err });
    });
  });

  return router;
};

async function getUser(req, res, next) {
    let user
    try {
        user = await collection.findById(req.params.id)
        console.log(user)
        if (user == null)
        res.status(404).json({message: "Cannot find user"})
    } catch(err) {
        res.status(500).send()
    }
    res.user = user
    next()
}

module.exports = createRouter;
