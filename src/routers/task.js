const express = require("express");
const Task = require("../models/task");
const auth = require("../middleware/auth")

const router = express.Router();

router.post('/tasks', auth, async (req, res) => {
    const tasks = new Task({
        ...req.body,
        owner: req.user._id
    })
    try {
        await tasks.save();
        res.status(201).send(tasks)
    } catch (e) {
        res.status(500).send()
    }
})

router.get('/tasks', auth, async (req, res) => {

    const { completed, limit, sortBy, pageNum } = req.query;
    const match = {
        owner: req.user._id
    };
    let sort = {};
    let limitNumeric;
    let skip;
    if (completed) {
        match.completed = completed === "true";
    }

    if (sortBy) {
        const parts = sortBy.split(":");
        sort = { [parts[0]]: `${parts[1]}` }
    }

    if (limit && pageNum) {
        skip = pageNum > 0 ? ((pageNum - 1) * limit) : 0;
        limitNumeric = parseInt(limit);
    }

    const tasks = await Task.find(match).sort(sort).skip(skip).limit(limitNumeric)
    try {
        res.send(tasks);
    } catch (e) {
        res.status(500).send()
    }
})

router.get('/tasks/:id', auth, async (req, res) => {
    const _id = req.params.id;
    try {
        const task = await Task.findById(_id);
        if (!task) {
            res.status(201).send();
        }
        res.send(task)
    } catch (e) {
        res.status(500).send()
    }
})

router.patch('/tasks/:id', auth, async (req, res) => {
    const _id = req.params.id;
    try {
        const task = await Task.findById(_id);
        if (!task) {
            return res.status(404).send()
        }
        const objKeys = Object.keys(req.body);
        objKeys.forEach((param) => task[param] = req.body[param]);
        await task.save();
        res.status(202).send(task)
    } catch (e) {
        res.status(401).send()
    }
})

router.delete('/tasks/:id', auth, async (req, res) => {
    const _id = req.params.id;
    try {
        const task = await Task.findByIdAndDelete(_id);
        if (!task) {
            return res.status(404).send()
        }
        res.status(202).send(task)
    } catch (e) {
        res.status(500).send()
    }
})

module.exports = router