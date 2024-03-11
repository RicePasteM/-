const fs = require('fs')
const request = require('request')

/**
 * 下载文件并写入本地磁盘
 * @param fileLink  文件URL地址
 * @param filePath  文件路径,如: c:xx/xx.jpg
 */
module.exports =  function getFile(fileLink, filePath){
 if (fileLink !== '') {
  return new Promise((resolve, reject) => {
    request({
      url: fileLink,
      method: 'GET', // 根据实际情况改变请求方式
      encoding: null
    }, (err, response, body) => {
      if (!err && response.statusCode === 200) {
        fs.writeFileSync(filePath, body, {encoding: "binary"})
        resolve(filePath)
      } else {
        reject(err)
      }
    })
  })
 }
}