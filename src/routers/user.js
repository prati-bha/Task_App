const express = require("express");
const User = require("../models/user");
const auth = require("../middleware/auth")
const router = express.Router();
router.post('/users/signUp', async (req, res) => {
    const user = new User(req.body);
    try {
        const token = await user.generateAuthToken();
        await user.save();
        res.send({
            user,
            token,
        })
    } catch (e) {
        res.status(401).send(e)
    }
})

router.post('/users/login', async (req, res) => {
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password);
        const token = await user.generateAuthToken();
        res.status(201).send({
            user,
            token,
        })
    } catch (error) {
        res.status(400).send(error)
    }
})
router.post('/users/logout', auth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token !== req.token
        });
        await req.user.save();
        res.send({
            user: req.user,
            "message": "User Logged Out Successfully !"
        })
    } catch (e) {
        res.status(500).send()
    }

})
router.post('/users/logoutAll', auth, async (req, res) => {
    try {
        req.user.tokens = [];
        await req.user.save();
        res.send({
            user: req.user,
            "message": "User Logged Out Successfully of All Devices!"
        })
    } catch (e) {
        console
        res.status(500).send()
    }

})



router.get('/users/me', auth, async (req, res) => {
    res.send(req.user)
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

router.patch('/users/:id', auth, async (req, res) => {
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

router.delete('/users/:id', auth, async (req, res) => {
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