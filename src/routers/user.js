const express = require("express");
const User = require("../models/user");
const auth = require("../middleware/auth")
const multer = require("multer");
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
        res.status(500).send()
    }

})



router.get('/users/me', auth, async (req, res) => {
    res.send(req.user)
})

const upload = multer({
    dest: "avatars",
    limits: {
        fileSize: 1000000
    },
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
            return cb(new Error('please upload an image'))
        }
        cb(undefined, true)
    }
});


router.post('/users/me/avatar', upload.single('upload'), async (req, res) => {
    res.status(200).send({
        message: "file uploaded"
    })
})

router.patch('/users/me', auth, async (req, res) => {
    try {
        const objKeys = Object.keys(req.body);
        objKeys.forEach((param) => req.user[param] = req.body[param]);
        await req.user.save();
        res.send(req.user)
    } catch (e) {
        res.status(401).send()
    }
})

router.delete('/users/me', auth, async (req, res) => {
    try {
        await req.user.remove();
        res.status(200).send(req.user);
    } catch (e) {
        res.status(500).send();
    }
})

module.exports = router