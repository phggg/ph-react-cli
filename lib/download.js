const download = require('download-git-repo')
const path = require("path")
const ora = require('ora')

module.exports = function (target) {
  // target = path.join(target || '.', '.download-temp')
  console.log(target);
  return new Promise((resolve, reject) => {
    // 这里可以根据具体的模板地址设置下载的url，注意，如果是git，url后面的branch不能忽略
    const url = 'https://github.com:phggg/react-template#master'
    const spinner = ora('正在下载模板...');
    spinner.start()
    download(url,
      target, { clone: true }, (err) => {
        if (err) {
          spinner.fail()
          reject(err)
        } else {
          // 下载的模板存放在一个临时路径中，下载完成后，可以向下通知这个临时路径，以便后续处理
          spinner.succeed()
          resolve(target)
        }
      })
  })
}
