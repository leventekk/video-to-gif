module.exports = {
  '*': 'prettier --write --ignore-unknown',
  '*.ts': 'eslint . --fix',
};
