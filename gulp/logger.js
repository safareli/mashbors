import notify from 'gulp-notify'
import gutil from  'gulp-util'
import chalk from  'chalk'
import prettyTime from 'pretty-hrtime'

var logError = (error,taskName) => { // See: https://github.com/mikaelbr/gulp-notify/issues/81#issuecomment-100422179
  var lineNumber = (error.lineNumber) ? 'LINE ' + error.lineNumber + ' -- ' : '';
  var message = error.message.replace(process.cwd(),':')
  global.isWatching && notify({
      title: 'Task Failed [' + taskName + ']',
      message: message,
      sound: 'Sosumi' // See: https://github.com/mikaelbr/node-notifier#all-notification-options-with-their-defaults
  }).write(error);

  // Easy error reporting
  // console.log(error.toString());
  // error.codeFrame && console.log(error.codeFrame);
  error.stack && console.log(error.stack);

  // throw error;

  // Pretty error reporting
  var report = '';
  var bgRed = gutil.colors.white.bgRed;

  report += bgRed('TASK:') + ' [' + taskName + ']\n';
  report += bgRed('PROB:') + ' ' + message + '\n';
  if (error.lineNumber) { report += bgRed('LINE:') + ' ' + error.lineNumber + '\n'; }
  if (error.fileName)   { report += bgRed('FILE:') + ' ' + error.fileName + '\n'; }
  console.error(report);

}


module.exports = {
  logError: logError,
  streamErrorLogger: function (error) {
    logError(error, error.plugin)
    // Prevent the 'watch' task from stopping
    this.emit('end');
  },
  taskStart: function(taskName){
    gutil.log('Starting', '\'' + chalk.cyan(taskName) + '\'...');
  },
  taskDuration: function(taskName){
    var start = process.hrtime();
    return ()=> {
      var hrDuration = process.hrtime(start);
      var time = prettyTime(hrDuration);
       gutil.log(
        'Finished', '\'' + chalk.cyan(taskName) + '\'',
        'after', chalk.magenta(time)
      );
    }
  }
}