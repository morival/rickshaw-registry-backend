const express = require('express');
const ObjectID = require('mongodb').ObjectId;
const bcrypt = require('bcrypt')

const createRouter = function(collection) {

  const router = express.Router();

  router.get('/', async (req, res) => {
    try {
        const data = await collection.find().toArray()
        res.json(data)
        // console.log(await collection.find().count())
    } catch(err) {
        res.status(500).json({ message: err.message})
    }
    // collection
    // .find()
    // .toArray()
    // .then((docs) => res.json(docs))
    // .catch((err) => {
    //   console.error(err);
    //   res.status(500);
    //   res.json({ status: 500, error: err });
    // });
  });

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


  router.put('/:id', async (req, res) => {
    const data = await collection.find().toArray()
    const id = req.params.id;
    const updatedData = req.body;
    delete updatedData._id;
    data.findOneAndUpdate({ _id: ObjectID(id) }, { $set: updatedData })
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

module.exports = createRouter;
