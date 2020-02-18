#!/usr/bin/env node

const program = require('commander')
const path = require('path')
const fs = require('fs')
const glob = require('glob') // npm i glob -D
const latestVersion = require('latest-version') //这个模块可以获取node包的最新版本
const download = require('./lib/download')
const inquirer = require('inquirer');
const generator = require('./lib/generator')
const chalk = require('chalk')
const logSymbols = require('log-symbols')

program.usage('<project-name>[project-name]')
  .parse(process.argv)

// 根据输入，获取项目名称
let projectName = program.args[0]

if (!projectName) {  // project-name 必填
  // 相当于执行命令的--help选项，显示help信息，这是commander内置的一个命令选项
  program.help()
  return
}

const list = glob.sync('*')  // 遍历当前目录
let next = undefined;
let rootName = path.basename(process.cwd())
if (list.length) {  // 如果当前目录不为空
  if (list.some(name => {
    const fileName = path.resolve(process.cwd(), name)
    const isDir = fs.statSync(fileName).isDirectory()
    return name === projectName && isDir
  })) {
    console.log(logSymbols.error, chalk.red(`项目${projectName}已经存在`))
    return
  }
  rootName = projectName
  next = Promise.resolve(projectName);
} else if (rootName === projectName) {
  next = inquirer.prompt([
    {
      name: 'buildInCurrent',
      message: '当前目录为空，且目录名称和项目名称相同，是否直接在当前目录下创建新项目？',
      type: 'confirm',
      default: true
    }
  ]).then(answer => {
    return Promise.resolve(answer.buildInCurrent ? '.' : projectName)
  })

} else {
  // rootName = projectName
  next = Promise.resolve(projectName)
}

next && go()

function go () {
  next.then(projectRoot => {
    console.log(projectRoot);
    if (projectRoot !== '.') {
      fs.mkdirSync(projectRoot)
    }
    return download(projectRoot).then(target => {
      return {
        name: projectRoot,
        root: projectRoot,
        downloadTemp: target
      }
    })
  })
    .then(context => {
      return inquirer.prompt([
        {
          name: 'name',
          message: '项目的名称',
          default: context.name
        }, {
          name: 'version',
          message: '项目的版本号',
          default: '1.0.0'
        }, {
          name: 'description',
          message: '项目的简介',
          default: `A project named ${context.name}`
        }, {
          name: 'author',
          message: '请输入作者名称',
          default: 'react'
        }
      ]).then((answers) => {
        return latestVersion('antd').then(version => {
          answers.supportUiVersion = version
          return {
            ...context,
            metadata: {
              ...answers
            }
          }
        }).catch(err => {
          return Promise.reject(err)
        })
      })
    })
    .then(context => {
      //删除临时文件夹，将文件移动到目标目录下
      return generator(context);
    })
    .then(context => {
      console.log(logSymbols.success, chalk.green('创建成功:)'))
      console.log()
      console.log(chalk.green('cd ' + context.root + '\nnpm install\nnpm build:dll\nnpm start'))
    }).catch(err => {
      console.error(err)
    })
}
