const express = require('express');
const ObjectID = require('mongodb').ObjectId;
const bcrypt = require('bcrypt');
const { json } = require('express');

const createUserRouter = function(collection) {
    
    const router = express.Router();
    
    
    //  AUTHENTIFICATE
    router.post('/login', async (req, res) => {
        try {
            const data = req.body;
            const login = data.login;
            const user = (await collection.find().toArray()).find(user => user.email === login || user.phoneNumber === login || user._id.toString() == login)
            console.log(user)
            if (user === undefined)
                res.status(404).json({ userLogin: "Cannot find user" })
            else if (await bcrypt.compare(data.password, user.password))
                res.json({ _id: user._id, message: "Authentification Success" })
            else 
            res.status(401).json({ password: "Incorrect Password" })
        } catch (err) {
            res.status(500).json({ message: err.message })
        }
    });


    //  GET ALL
    router.get('/', async (req, res) => {
        try {
            const data = await collection.find().toArray();
            res.json(data)
        } catch (err) {
            res.status(500).json({ message: err.message})
        }
    });


    //  GET ONE BY ID
    router.get('/:id', async (req, res) => {
        const id = req.params.id;
        console.log(id)
        try {
            const user = await collection.findOne({ _id: ObjectID(id) })
            console.log(user)
            delete user.password
            res.status(200).json(user)
        } catch {
            res.status(404).json({ message: "Cannot find user" })
        }
    })


    // TEST FOR DUPLICATE EMAIL OR PHONE NUMBER IN OTHER USERS
    router.post('/testForDuplicate', async (req, res ) => {
        const data = req.body;
        const testResponse = {email: "", phoneNumber: ""};
        try {
            const findUserByEmail = await collection.findOne({ email: data.email })
            const findUserByPhoneNo = await collection.findOne({ phoneNumber: data.phoneNumber })
            if (findUserByEmail && findUserByEmail._id.toString() !== data._id)
                testResponse.email = "The email already exists";
            if (findUserByPhoneNo && findUserByPhoneNo._id.toString() !== data._id)
                testResponse.phoneNumber = "The phone number already exists";
            if (testResponse.email !== "" || testResponse.phoneNumber !== "")
                res.status(203).json(testResponse) 
            else
                res.status(200).json(testResponse)
        } catch (err) {
            res.status(500).json({ message: err.message })
        }
    })


    //  REQUEST PASSWORD RESET
    router.post('/resetPassword', async (req, res) => {
        const data = req.body;
        console.log(data)
        try {
            const findUserByEmail = await collection.findOne({ email: data.email })
            if (findUserByEmail)
                res.status(200).json({ code: "email", message: "Email found" })
            else
                res.status(202).json({ code: "email", message: "Email not found" })
        } catch (err) {
            res.status(500).json({ message: err.message })
        }
    })


    //  CREATE ONE
    router.post('/', async (req, res) => {
        const data = req.body;
        try {
            const hashedPassword = await bcrypt.hash(data.password, 10)
            const user = {
                name: data.name,
                email: data.email,
                phoneNumber: data.phoneNumber,
                password: hashedPassword,
                dOB: "",
                line_1: "",
                line_2: "",
                line_3: "",
                post_town: "",
                postcode: "",
                lic_type: "",
                lic_no: "",
                lic_name: "",
                lic_isb: "",
                lic_iso: "",
                lic_exp: "",
                acc_type: "user",
                registerDate: data.registerDate
            }
            await collection.insertOne(user)
            delete user.password
            res.status(201).json(user)
        } catch (err) {
            res.status(500).json({ message: err.message })
        }
    });


    // UPDATE ONE 
    router.put('/:updateAs/:id', async (req, res) => {
        const data = req.body;
        const updateAs = req.params.updateAs
        const id = req.params.id;
        delete data._id;
        delete data.registerDate;
        // console.log(updateAs)
        try {
            if (updateAs === "user") {
                const hashedPassword = await bcrypt.hash(data.password, 10);
                data.password = hashedPassword;
            } else if (updateAs === "admin") {
                delete data.password;
            }
            await collection.findOneAndUpdate({ _id: ObjectID(id) },{ $set: data },{returnOriginal: false});
            const user = await collection.findOne({ _id: ObjectID(id) });
            delete user.password
            console.log(user)
            res.status(200).json(user)
        } catch (err) {
            res.status(500).json({  message: err.message })
        }
    });


    //  DELETE ONE
    router.delete('/:id', async (req, res) => {
        const id = req.params.id;
        const user = await collection.findOne({ _id: ObjectID(id) })
        if (user === null)
            res.status(404).json({ message: "Cannot find user" })
        try {
            const del = await collection.deleteOne({ _id: ObjectID(id) })
            console.log(del)
            res.status(200).json({ code: "account", message: `Deleted ${user.name}` })
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
            res.status(200).json({ code:"accounts", message: `Deleted ${del.deletedCount} account${del.deletedCount > 1 ? "s": ""}` })
        } catch (err) {
            res.status(500).json({ message: err.message })
        }
    })
    

    return router; 
};

module.exports = createUserRouter;
