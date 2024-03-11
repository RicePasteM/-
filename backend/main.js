let express = require('express');
let expressWs = require('express-ws');
require('./utils/objectFilter');
require('./utils/vconsole');
const multer = require('multer')
const c = require('child_process');
const fs = require("fs");

const upload = multer({
    dest: './upload'
})

let app = express();
expressWs(app);

app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: false, limit: '5mb' }));
app.use(express.static('upload'));
app.use(express.static('public'));
app.use(express.static('webapp'));
app.use(upload.any())

//设置允许跨域访问该服务.
app.all('*', function (req, res, next) {
	res.header('Access-Control-Allow-Origin', '*');
	res.header('Access-Control-Allow-Headers', '*');
	res.header('Access-Control-Allow-Methods', '*');
	res.header('Content-Type', 'application/json;charset=utf-8');
	next();
});

//活跃用户与QPS统计中间件
app.use(async (req, res, next) => {
	// 获取客户端IP
	next();
});


//客户端请求版本和设备处理中间件
app.use(async (req, res, next) => {
	if(req.method != 'OPTIONS'){
		console.log(req.url,req.headers.appversion,req.method);
	}
	next();
});

//路由中间件
let planRouter = require('./routes/plans');
let courseRouter = require('./routes/courses');
let taskRouter = require('./routes/tasks');

app.use('/plans', planRouter);
app.use('/courses', courseRouter);
app.use('/tasks', taskRouter);

let server = app.listen(8010, function () {
	let host = server.address().address;
	let port = server.address().port;
	console.log('服务器已在' + host + ':' + port + '上启动。');
});


let clientConnections = 0;
app.ws('/socket', function (ws, req){
	clientConnections ++;
	ws.on('close', function (ev) {
		clientConnections --;
		if(clientConnections == 0){
			process.exit();
		}
	})
})


// 使用默认浏览器打开
c.exec('start http://127.0.0.1:8010');

// function hideSelf() {

//     let powershellScript = `
//     Add-Type -Name Window -Namespace Console -MemberDefinition '
//     [DllImport("Kernel32.dll")]
//     public static extern IntPtr GetConsoleWindow();

//     [DllImport("user32.dll")]
//     public static extern bool ShowWindow(IntPtr hWnd, Int32 nCmdShow);
//     '

//     $consolePtr = [Console.Window]::GetConsoleWindow()
//     #0 hide
//     [Console.Window]::ShowWindow($consolePtr, 0)
//     `;

//     let workingDir = process.cwd();
//     let tempfile = `${workingDir}\\temp.ps1`;
//     fs.writeFileSync(tempfile, powershellScript);

//     //a little convoluted to get around powershell script execution policy (might be disabled)
//     require('child_process').execSync(`type .\\temp.ps1 | powershell.exe -noprofile -`, {stdio: 'inherit'});
//     fs.unlinkSync(tempfile); //delete temp file
// }

// hideSelf()