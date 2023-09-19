/**
 * @callback composeCallback
 * @param {string[]} files Staged Files
 * @returns {string} Composed command with optional filenames
 */

/**
 * @function composeCommand
 * @param {string} command Command to call on the staged files
 * @return {composeCallback} callback
 */
function composeCommand(command) {
  /**
   * @function executeCommand
   * @callback composeCallback
   */
  return function executeCommand(files) {
    if (files.length > 10) {
      return `${command} .`;
    }

    return `${command} ${files.join(' ')}`;
  };
}

module.exports = {
  '*': composeCommand('prettier --write --ignore-unknown'),
  '*.ts': composeCommand('eslint --fix'),
};
