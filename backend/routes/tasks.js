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

const compareGrade = (a, b) => {
    if (a == undefined) a = { courseMark: 0 };
    if (b == undefined) b = { courseMark: 0 };
    if (a.courseMark == "未考" || a.courseMark == "旷考" || a.courseMark == "不及格") {
        a.courseMark = 0;
    }
    if (b.courseMark == "未考" || b.courseMark == "旷考" || b.courseMark == "不及格") {
        b.courseMark = 0;
    }
    if (a.courseMark == "及格") a.courseMark = 60;
    if (b.courseMark == "及格") b.courseMark = 60;
    if (a.courseMark == "中") a.courseMark = 70;
    if (b.courseMark == "中") b.courseMark = 70;
    if (a.courseMark == "良") a.courseMark = 80;
    if (b.courseMark == "良") b.courseMark = 80;
    if (a.courseMark == "优") a.courseMark = 90;
    if (b.courseMark == "优") b.courseMark = 90;
    return Number(a.courseMark) - Number(b.courseMark)
}

const numericalGrade = (g) => {
    if (g == "未考" || g == "旷考" || g == "不及格") {
        g = 0;
    }
    if (g == "及格") g = 60;
    if (g == "中") g = 70;
    if (g == "良") g = 80;
    if (g == "优") g = 90;
    return Number(g);
}

const getFinalGrade = (studentGrades, repeatMode) => {
    if (repeatMode == "取最初成绩") {
        studentGrades.sort((a, b) => {
            return (a.semester > b.semester) ? 1 : -1;
        })
        return studentGrades[0];
    } else if (repeatMode == "取最高成绩") {
        studentGrades.sort(compareGrade);
        return studentGrades[studentGrades.length - 1];
    }
}

let gradesInfo = {};

function getId() {
    let date = Date.now();
    let rund = Math.ceil(Math.random()*1000)
    let id = date + '' + rund;
    return id;
}


// 创建路由对象
let router = express.Router();

router.post('/importByExcel', async (req, res) => {
    try {
        let taskId = getId();
        let file = req.files[0];
        const file_content = nodeXlsx.parse("./upload/" + file.filename)
        const th2key = {
            "学号": "studentId",
            "姓名": "studentName",
            "学期": "semester",
            "课程代码": "courseCode",
            "课程名称": "courseName",
            "成绩": "courseMark",
            "学分": "courseCredit",
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
        gradesInfo[taskId] = [];
        for(let row of tableData){
            let grade = {};
            for(key in key2idx){
                grade[key] = row[key2idx[key]];
            }
            gradesInfo[taskId].push(grade);
        }
        // console.log(gradesInfo);
        res.status(200).json(responses.SUCCESS({taskId}));
        fs.unlinkSync("./upload/" + file.filename);
    } catch (e) {
        res.status(400).send(e);
        fs.unlinkSync("./upload/" + file.filename);
        console.log(e);
    }
})


router.get('/getStudentsList', async (req, res) => {
    try {
        const gradeByStudents = {};
        const students = [];
        for(let grade of gradesInfo[req.query.taskId]){
            if(gradeByStudents[grade.studentId] == undefined){
                gradeByStudents[grade.studentId] = [];
            }
            gradeByStudents[grade.studentId].push(grade);
        }
        // 按学生进行情况统计
        for(let studentId in gradeByStudents){
            students.push({
                studentId, studentName: gradeByStudents[studentId][0].studentName
            })
        }
        res.status(200).json(responses.SUCCESS(students));
    } catch (e) {
        res.status(400).send(e);
        console.log(e);
    }
})

router.get('/getDataByStudentId', async (req, res) => {
    try {
        const gradeByStudents = {};
        for(let grade of gradesInfo[req.query.taskId]){
            if(gradeByStudents[grade.studentId] == undefined){
                gradeByStudents[grade.studentId] = [];
            }
            gradeByStudents[grade.studentId].push(grade);
        }
        res.status(200).json(responses.SUCCESS(gradeByStudents[req.query.studentId]));
    } catch (e) {
        res.status(400).send(e);
        console.log(e);
    }
})


router.get('/getGradeStatistics', async (req, res) => {
    try {
        const gradeByStudents = {};
        for(let grade of gradesInfo[req.query.taskId]){
            if(gradeByStudents[grade.studentId] == undefined){
                gradeByStudents[grade.studentId] = [];
            }
            gradeByStudents[grade.studentId].push(grade);
        }
        const planCourses = await Course.findAll({
            where: {
                planId: req.query.planId
            }
        })
        const resultData = [["",""], ["",""], ["",""], ["学号","姓名"]];
        // 生成表头
        for(let item of planCourses){
            resultData[0].push(item.courseCategory)
            resultData[1].push(item.courseCode)
            resultData[2].push(item.courseName)
            resultData[3].push(item.courseCredit)
        }
        resultData[3].push("学分*成绩和")
        resultData[3].push("总学分")
        resultData[3].push("修读课程数")
        resultData[3].push("平均学分成绩")
        let rowIndex = 4;
        for(let studentId in gradeByStudents){
            resultData[rowIndex] = [];
            resultData[rowIndex][0] = studentId;
            resultData[rowIndex][1] = gradeByStudents[studentId][0]["studentName"];
            let totalCredit = 0;
            let courseCount = 0;
            let totalCreditMulMark = 0;
            for(let planCourse of planCourses){
                let grades = [];
                for(let grade of gradeByStudents[studentId]){
                    if(grade.courseCode == planCourse.courseCode){
                        grades.push(grade);
                    }
                }
                let finalGrade = getFinalGrade(grades, req.query.repeatMode);
                // 说明修了这门课
                if(finalGrade?.courseMark != undefined){
                    totalCredit += Number(planCourse.courseCredit);
                    courseCount += 1;
                    totalCreditMulMark += numericalGrade(finalGrade?.courseMark) * Number(planCourse.courseCredit);
                }
                resultData[rowIndex].push(finalGrade?.courseMark);
            }
            resultData[rowIndex].push(totalCreditMulMark);
            resultData[rowIndex].push(totalCredit);
            resultData[rowIndex].push(courseCount);
            resultData[rowIndex].push(totalCreditMulMark/totalCredit);
            rowIndex ++;
        }
        let buffer = nodeXlsx.build([
            {
                name: 'sheet1',
                data: resultData
            }
        ]);
        fs.writeFileSync('./public/result.xlsx',buffer,{'flag':'w'});
        res.status(200).json(responses.OK());
    } catch (e) {
        res.status(400).send(e);
        console.log(e);
    }
})


module.exports = router;