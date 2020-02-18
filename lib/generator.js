const Metalsmith = require('metalsmith')
const handlebars = require('handlebars')
const fs = require('fs');
const rm = require('rimraf').sync

module.exports = function (context) {
  let metadata = context.metadata;
  let src = context.downloadTemp;
  if (!src) {
    return Promise.reject(new Error(`无效的source：${src}`))
  }
  return new Promise((resolve, reject) => {
    const fileName = `${src}/package.json`;
    const meta = {
      name: metadata.name,
      version: metadata.version,
      description: metadata.description,
      author: metadata.author
    }
    try {
      if (fs.existsSync(fileName)) {
        const content = fs.readFileSync(fileName).toString();
        const result = handlebars.compile(content)(meta);
        fs.writeFileSync(fileName, result);
        resolve(context)
      }
    } catch (e) {
      rm(src)
      reject(e)
    }
  })
}