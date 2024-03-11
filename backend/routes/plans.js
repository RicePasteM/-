// 引入依赖包
let express = require('express');
let { query } = require('../sql.js');
const multer = require('multer')
const upload = multer({ dest: 'upload' }) // 1.定义文件的存放位置，不带 / 的是相对位置
const xlsx = require("xlsx");
const path = require('path');
const moment = require("moment");
const fs = require("fs");
let axios = require("axios");
const nodeXlsx = require('node-xlsx')
const responses = require("../utils/responses.js");
const Plan = require("../models/Plan.js");
const Course = require("../models/Course.js");

// 创建路由对象
let router = express.Router();

router.get("/getAllPlans", async (req, res) => {
    try {
        let result = await Plan.findAll();
        res.status(200).json(responses.SUCCESS(result));
    } catch (e) {
        res.status(400).send(responses.BAD_REQUEST());
        console.log(e);
    }
})

router.post("/createPlan", async (req, res) => {
    try {
        let result = await Plan.create(req.body);
        res.status(200).json(responses.OK());
    } catch (e) {
        res.status(400).send(responses.BAD_REQUEST());
        console.log(e);
    }
})

router.post("/editPlan", async (req, res) => {
    try {
        let result = await Plan.update(req.body, {
            where: {
                planId: req.body.planId
            }
        })
        res.status(200).json(responses.OK());
    } catch (e) {
        res.status(400).send(responses.BAD_REQUEST());
        console.log(e);
    }
})

router.post("/deletePlan", async (req, res) => {
    try {
        await Plan.destroy({
            where: {
                planId: req.body.planId
            }
        })
        await Course.destroy({
            where: {
                planId: req.body.planId
            }
        })
        res.status(200).json(responses.OK());
    } catch (e) {
        res.status(400).send(responses.BAD_REQUEST());
        console.log(e);
    }
})

router.post("/getPlanById", async (req, res) => {
    try {
        let result = await Plan.findOne({
            where: {
                planId: req.body.planId
            }
        });
        res.status(200).json(responses.SUCCESS(result));
    } catch (e) {
        res.status(400).send(responses.BAD_REQUEST());
        console.log(e);
    }
})

module.exports = router;