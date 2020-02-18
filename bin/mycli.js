const program = require('commander');

const { version } = require('../utils/constants');

program.version(version, '-v, --version')
  .usage('<command> [项目名称]')
  .command('init', '创建新项目')
  .parse(process.argv)