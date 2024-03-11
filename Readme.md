# HFUTSoftGradeStatistics - 合工大软院学生成绩统计工具箱

此为合工大软院学生成绩统计工具箱，支持通过上传既有的学生成绩表，快速对学生的教学方案完成情况和学生的必修课平均学分成绩进行计算。

理论上支持大部分学院的课程方案，但是本系统是基于软件学院的需求开发的。

## 功能

1. 教学计划管理：向系统上传教学计划文档，并完成对教学计划的管理。每个教学计划有若干个教学计划项目，教学计划项目包含课程模块、课程代码、课程名称、学分四个项目。其中，还有下面两个特殊情况：① 每个教学计划还存在方向课的情况，需要手动指定方向课集合；② 每个教学计划还需要手动指定公选课的选修要求。
2. 上传学生成绩：向系统上传学生成绩文档，每个学生成绩文档有若干个项目，包含学号、姓名、学期、课程代码、课程名称、成绩、绩点、学分。
3. 成绩统计和分析：上传完成后，自动进行成绩统计和分析，并展示结果。

## 截图

![](https://storage.codesocean.top/api/resource/get/171012728068783)

![](https://storage.codesocean.top/api/resource/get/171012728069454)

![](https://storage.codesocean.top/api/resource/get/171012728072055)

## 使用方式

1. 安装 `Node.js v18.19.1`

2. `pull`此仓库

3. 打开`backend`文件夹

4. 在文件夹下打开终端，使用`npm install`或`cnpm install`安装依赖

5. 执行指令`npm run dev`，即可直接使用。

## 项目结构

此项目采用`Web`技术开发，采用了标准的前后端分离架构。但其设计的使用场景是在本地机器上运行，因此使用了`sqlite`作为数据库，并在最后阶段使用`nexe`进行封装。

后端部分使用`Express`框架和`Sequelize`框架，前端部分使用`Vue`框架与`Naive UI`框架搭建。

前后端通过一个`WebSocket`连接进行强绑定，一旦断开连接后端会自动退出，从而实现了类桌面端程序的效果。

## 开发

### Clone

如果你安装了git，使用 `git clone git@github.com:RicePasteM/HFUTSoftGradeStatistics.git` 来 clone 此项目到你的本地.

### Build

你需要`Node.js v18.19.1`来运行此项目。 首先在项目文件夹执行 `npm install` 来安装所有依赖环境。 然后使用`npm run dev`来运行。

### Issues

你发现了一个bug？ 如果你确信该bug由此程序自身引起，请在本项目的issue部分提起。

### Contributing

我非常欢迎你的贡献！ 在该项目拉起一个pull request即可。

**如果你希望你的贡献被合并，请务必确保它们是正确的，并经过有效的测试。**
