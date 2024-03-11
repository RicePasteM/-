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

router.get("/getCoursesByPlanId", async (req, res) => {
    try {
        let result = await Course.findAll({
            where: {
                planId: req.query.planId
            }
        });
        res.status(200).json(responses.SUCCESS(result));
    } catch (e) {
        res.status(400).send(responses.BAD_REQUEST());
        console.log(e);
    }
})

router.post("/createCourse", async (req, res) => {
    try {
        let result = await Course.create(req.body);
        res.status(200).json(responses.OK());
    } catch (e) {
        res.status(400).send(responses.BAD_REQUEST());
        console.log(e);
    }
})

router.post("/editCourse", async (req, res) => {
    try {
        let result = await Course.update(req.body, {
            where: {
                planId: req.body.planId,
                courseId: req.body.courseId
            }
        })
        res.status(200).json(responses.OK());
    } catch (e) {
        res.status(400).send(responses.BAD_REQUEST());
        console.log(e);
    }
})

router.post("/deleteCourse", async (req, res) => {
    try {
        let result = await Course.destroy({
            where: {
                courseId: req.body.courseId
            }
        })
        res.status(200).json(responses.OK());
    } catch (e) {
        res.status(400).send(responses.BAD_REQUEST());
        console.log(e);
    }
})

router.post('/importByExcel', async (req, res) => {
    try {
        let file = req.files[0];
        const file_content = nodeXlsx.parse("./upload/" + file.filename)
        const th2key = {
            "课程模块": "courseCategory",
            "课程代码": "courseCode",
            "课程名称": "courseName",
            "学分": "courseCredit"
        }
        let key2idx = {}
        const sheetData = file_content[0].data;
        const tableHead = sheetData[0];
        const tableData = sheetData.slice(1);
        for(let th in th2key){
            let idx = tableHead.indexOf(th);
            if(idx == -1){
                res.status(400).send(responses.BAD_REQUEST("上传的表格不符合格式要求"));
                return;
            } else {
                key2idx[th2key[th]] = idx;
            }
        }
        // 开始解析表格行
        for(let row of tableData){
            let course = {planId: req.body.planId};
            for(key in key2idx){
                course[key] = row[key2idx[key]];
            }
            await Course.destroy({
                where: {
                    planId: req.body.planId,
                    courseCode: course.courseCode
                }
            })
            await Course.create(course);
        }
        res.status(200).json(responses.OK());
        fs.unlinkSync("./upload/" + file.filename);
    } catch (e) {
        res.status(400).send(e);
        fs.unlinkSync("./upload/" + file.filename);
        console.log(e);
    }
})


module.exports = router;