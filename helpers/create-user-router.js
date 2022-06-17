const express = require('express');
const ObjectID = require('mongodb').ObjectId;
const bcrypt = require('bcrypt')

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
                res.status(404).json({ code: "userLogin", message: "Cannot find user" })
            else if (await bcrypt.compare(data.password, user.password))
                res.json({ id: user._id, message: "Authentification Success" })
            else 
            res.status(401).json({ code: "password", message: "Incorrect Password" })
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
        try {
            const user = await collection.findOne({ _id: ObjectID(id) })
            console.log(user)
            delete user.password
            res.status(200).json(user)
        } catch {
            res.status(404).json({ message: "Cannot find user" })
        }
    })


    //  TEST FOR DUPLICATE EMAIL
    router.post('/email', async (req, res) => {
        const data = req.body;
        try {
            const findUserByEmail = await collection.findOne({ email: data.email })
            if (findUserByEmail && findUserByEmail._id.toString() === data._id)
                res.status(202).json({ code: "email", message: "Duplicated email and ID" })
            else if (findUserByEmail)
                res.status(200).json({ code: "email", message: "The email already exists" })
            else
                res.status(202).json({ code: "email", message: "Email not found" })
        } catch (err) {
            res.status(500).json({ message: err.message })
        }
    })


    //  TEST FOR DUPLICATE PHONE NUMBER
    router.post('/phoneNumber', async (req, res) => {
        const data = req.body;
        try {
            const findUserByPhoneNo = await collection.findOne({ phoneNumber: data.phoneNumber })
            if (findUserByPhoneNo && findUserByPhoneNo._id.toString() === data._id)
                res.status(202).json({ code: "phoneNumber", message: "Duplicated phone number and ID" })
            else if (findUserByPhoneNo)
                res.status(200).json({ code: "phoneNumber", message: "The phone number already exists" })
            else
                res.status(202).json({ code: "phoneNumber", message: "Phone number not found" })
        } catch (err) {
            res.status(500).json({ message: err.message })
        }
    })


    // //  CHECK IF USER WITH EMAIL OR PHONE NUMBER ALREADY EXISTS
    // router.post('/includes', async (req, res) => {
    //     const object = req.body;
    //     try {
    //         const findUserByEmail = await collection.findOne({ email: object.email })
    //         const findUserByPhoneNo = await collection.findOne({ phoneNumber: object.phoneNumber })
    //         const findUserbyID = await collection.findOne({ _id: ObjectID(object._id) })
    //         if (findUserByEmail && findUserByEmail._id.toString() !== findUserbyID._id.toString()) 
    //             res.status(409).json({ code: "email", message: "The email already exists" })
    //         else if (findUserByPhoneNo && findUserByPhoneNo._id.toString() !== findUserbyID._id.toString()) 
    //             res.status(409).json({ code: "phoneNumber", message: "The phone number already exists" })
    //         else
    //             res.status(200).json({ message: "ok" })
    //             // console.log("ok")
    //     } catch (err) {
    //         res.status(500).json({ message: err.message })
    //     }
    // })


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
                acc_type: "",
                registerDate: data.registerDate
            }
            // console.log(user)
            const testEmail = await collection.findOne({ email: user.email })
            const testPhoneNumber = await collection.findOne({ phoneNumber: user.phoneNumber })
            if (!testEmail && !testPhoneNumber) {
                    await collection.insertOne(user)
                    delete user.password
                    res.status(201).json(user)
            } else if (testEmail) {
                res.status(409).json({ code: "email", message: "The email already exists" })
            } else if (testPhoneNumber) {
                res.status(409).json({ code: "phoneNumber", message: "The phone number already exists" })
            }
        } catch (err) {
            res.status(500).json({ message: err.message })
        }
    });


    //  UPDATE ONE
    router.put('/:id', async (req, res) => {
        try {
            const data = req.body
            const id = req.params.id;
            delete data._id;
            if (data.password) {
                const hashedPassword = await bcrypt.hash(data.password, 10)
                data.password = hashedPassword
            }
            console.log(data)
                    await collection.findOneAndUpdate({ _id: ObjectID(id) },{ $set: data },{returnOriginal: false});
                    const user = await collection.findOne({ _id: ObjectID(id) })
                    delete user.password
                    res.status(200).json(user)
        } catch (err) {
            res.status(500).json({ message: err.message })
        }
    });


    //  DELETE ONE
    router.delete('/:id', async (req, res) => {
        const id = req.params.id;
        const user = await collection.findOne({ _id: ObjectID(id) })
        if (user === null)
            res.status(404).json({ message: "Cannot find user" })
        try {
            const deleteAction = await collection.deleteOne({ _id: ObjectID(id) })
            console.log(deleteAction)
            res.status(200).json({ code: "account", message: `Deleted ${user.name}` })
        } catch (err) {
            res.status(500).json({ message: err.message })
        }
    });
    

    return router; 
};

module.exports = createUserRouter;
