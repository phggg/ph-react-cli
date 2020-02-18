#!/usr/bin/env node
/**
 * Created by mapbar_front on 2020-02-17.
 */
const fs = require('fs');
const program = require('commander');
const download = require('download-git-repo'); // download-git-repo负责下载对应模板项目的git仓库
const handlebars = require('handlebars');
const inquirer = require('inquirer');  // inquirer负责问询
const ora = require('ora'); // 一个优雅地命令行交互spinner
const chalk = require('chalk'); // 改变命令行输出样式
const symbols = require('log-symbols'); //为各种日志级别提供着色的符号
program.version('1.0.0', '-v, --version')
  .command('init <name>')
  .action((name) => {
    if (!fs.existsSync(name)) {
      inquirer.prompt([
        {
          name: 'description',
          message: '请输入项目描述'
        },
        {
          name: 'author',
          message: '请输入作者名称'
        }
      ]).then((answers) => {
        const spinner = ora('正在下载模板...');
        spinner.start();
        download('https://github.com:phggg/vue-mobile-template#master', name, { clone: true }, (err) => {
          if (err) {
            spinner.fail();
            console.log(symbols.error, chalk.red(err));
          } else {
            spinner.succeed();
            const fileName = `${name}/package.json`;
            const meta = {
              name,
              description: answers.description,
              author: answers.author
            }
            if (fs.existsSync(fileName)) {
              const content = fs.readFileSync(fileName).toString();
              const result = handlebars.compile(content)(meta);
              fs.writeFileSync(fileName, result);
            }
            console.log(symbols.success, chalk.green('项目初始化完成'));
          }
        })
      })
    } else {
      // 错误提示项目已存在，避免覆盖原有项目
      console.log(symbols.error, chalk.red('项目已存在'));
    }
  })
program.parse(process.argv);
