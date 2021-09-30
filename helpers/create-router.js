const express = require('express');
const ObjectID = require('mongodb').ObjectID;
const bcrypt = require('bcrypt')

const createRouter = function(collection) {

  const router = express.Router();

  router.get('/', (req, res) => {
    collection
    .find()
    .toArray()
    .then((docs) => res.json(docs))
    .catch((err) => {
      console.error(err);
      res.status(500);
      res.json({ status: 500, error: err });
    });
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
    } catch {
        res.status(500).send()
    }
    // const newData = req.body;
    // collection
    // .insertOne(newData)
    // .then((result) => {
    //   res.json(result.ops[0]);
    // })
    // .catch((err) => {
    //   console.error(err);
    //   res.status(500);
    //   res.json({ status: 500, error: err });
    // });
  });

  router.put('/:id', (req, res) => {
    const id = req.params.id;
    const updatedData = req.body;
    delete updatedData._id;

    collection
    .findOneAndUpdate({ _id: ObjectID(id) }, { $set: updatedData })
    .then(result => {
      res.json(result.value);
    })
    .catch((err) => {
      res.status(500);
      res.json({ status: 500, error: err });
    });
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
