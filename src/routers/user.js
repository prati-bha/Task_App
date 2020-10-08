const express = require("express");
const User = require("../models/user");

const router = express.Router();
router.post('/users', async (req, res) => {
    const user = new User(req.body);
    try {
        await user.save();
        res.status(201).send(user);
    } catch (e) {
        res.status(401).send(e)
    }
})

router.post('/users/login', async (req, res) => {
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password)
        res.send(user)
    } catch (error) {
        res.status(400).send(error)
    }
})

router.get('/users', async (req, res) => {
    try {
        const users = await User.find({});
        res.send(users);
    } catch (e) {
        res.status(500).send()
    }
})

router.get('/users/:id', async (req, res) => {
    const _id = req.params.id;
    try {
        const user = await User.findById(_id);
        if (!user) {
            res.status(201).send();
        }
        res.send(user)
    } catch (e) {
        res.status(500).send()
    }
})

router.patch('/users/:id', async (req, res) => {
    const _id = req.params.id;
    try {
        const user = await User.findById(_id);
        if (!user) {
            return res.status(404).send()
        }
        const objKeys = Object.keys(req.body);
        objKeys.forEach((param) => user[param] = req.body[param]);
        await user.save();
        res.send(user)
    } catch (e) {
        res.status(401).send()
    }
})

router.delete('/users/:id', async (req, res) => {
    const _id = req.params.id;
    try {
        const task = await Task.findByIdAndDelete(_id, req.body);
        if (!task) {
            return res.status(404).send()
        }
        res.status(202).send(task)
    } catch (e) {
        res.status(500).send()
    }
})

module.exports = router