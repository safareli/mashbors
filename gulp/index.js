import gulp from  'gulp'
import gutil from  'gulp-util'
import chalk from  'chalk'
import R from  'ramda'
import runSequence from  'run-sequence'
import browserSync from 'browser-sync'
import sassInheritance from 'gulp-sass-inheritance'
import del from 'del'
import watch from 'gulp-watch'
import path from 'path'
import fs from 'fs'
import perfectionist from 'perfectionist'
import autoprefixer from 'autoprefixer'
import glob from  'glob-stream'
import concat from  'gulp-concat'
import header from  'gulp-header'
import sass from  'gulp-sass'
import jsonImporter from  'node-sass-json-importer'
import prettify from  'gulp-prettify'
import postcss from  'gulp-postcss'
import mqpacker from  'css-mqpacker'
import plumber from  'gulp-plumber'
import es from 'event-stream'
import through2 from 'through2'
import minimatch from 'minimatch'
import Combiner from 'stream-combiner'
import requireGraph from './require-graph'
import File from 'vinyl'
import changedInPlace from 'gulp-changed-in-place'
import desugar from './react-classname-desugar'
import logger from './logger'
import {argv} from 'yargs'


var reload = browserSync.reload

gulp.task('build',R.unary(
  R.partial(
    runSequence,
    'clean',
    [
      'scripts',
      'styles',
      'public',
      'assets',
      'libs'
    ]
    )
  )
)

gulp.task('scripts', () => {
  return gulp.src('src/scripts/*.*')
    .pipe(concat('main.js'))
    .pipe(gulp.dest('build/'))
    .pipe(reload({stream: true}))
})

var buildStyles = function (banner,fileGlob){
  return gulp.src(fileGlob,{base:'./src/ui'})
    .pipe(plumber({ errorHandler: logger.streamErrorlogger }))
    .pipe(sassInheritance({debug:debug.DEBUG, dir:'./src/ui'}))
    .pipe(header(banner))
    .pipe(sass({
      importer:jsonImporter
    }))
    .pipe(changedInPlace({firstPass:true}))
    .pipe(postcss([
      autoprefixer({
        browsers: [ 'last 2 versions' ]
      }),
      mqpacker,
      perfectionist({
        indentSize:2,
        format: 'expanded'
      })
    ]))
    .pipe(gulp.dest('./build/styles'))
    .on('end', logger.taskDuration('styles'))
    .pipe(through2.obj(function (file, enc, callback) {
      debug.log('path',file.path)
      callback(null, file)
    }))
    .pipe(reload({stream: true}))

}

gulp.task('styles', () => {
  var style = require('../src/ui/style');
  return buildStyles(style.header, './src/ui/**/*.scss')
})



const debug = ((DEBUG) => {
  return {
    DEBUG: DEBUG,
    log: function(...args){
      DEBUG && console.log.apply(console,args)
    },
    performance: function(...args){
      DEBUG && console.time.apply(console,args)
    },
    performanceEnd: function(...args){
      DEBUG && console.timeEnd.apply(console,args)
    },
  }
}(argv.d))


var createTargetPath = (srcPath) => {
    var { root, dir, name } = path.parse(srcPath)
    var targetDir = dir.replace('src/public','')
    var targetFile = 'index.html'
    var targetDirExtra = name === 'index' ? '' : name
    return path.join(targetDir, targetDirExtra, targetFile)
}

var createMetaData = (filePath, tartegPath) => {
  var obj = require(filePath)
  return {
    templatePath: path.join(process.cwd(),'src/templates', obj.template)+ '.jsx',
    title: obj.title,
    data: obj.data,
  }
}

var createContents = (metaData, root) => {
  var template = require(metaData.templatePath)
  return new Buffer(template({
    title: metaData.title,
    data: metaData.data,
    root: root
  }))
}

var publicFilePipe = (shouldBuildPublicFile) => {
  debug.performance('decache')
  requireGraph.decacheWithGlob('src/**/*.*')
  debug.performanceEnd('decache')

  return Combiner(
    glob.create('src/public/**/*.*',{cwdbase:true}),
    plumber({ errorHandler: logger.streamErrorlogger }),
    through2.obj(function (file, enc, callback) {

      debug.performance('createmeta '+file.path)
      var tartegPath = createTargetPath(file.path)
      try {
        var metaData = createMetaData(file.path)
      } catch(e) {
        logger.logError(e,'public');
        callback()
        return
      }
      var root = path.normalize(path.relative(path.dirname(tartegPath),file.base))

      if(shouldBuildPublicFile(file.path,metaData.templatePath)){
        debug.performanceEnd('createmeta '+file.path)
        this.push({
          data: metaData,
          root: root,
          file: new File({
            cwd: file.cwd,
            base: file.base,
            path: tartegPath,
            contents: null
          })
        })
      }else{
        debug.performanceEnd('createmeta '+file.path)
      }
      callback()
    }),
    through2.obj(function (obj, enc, callback) {
      var performanceMessage = 'createContents '+ obj.file.path
      debug.performance(performanceMessage)
      try {
        obj.file.contents = createContents(obj.data, obj.root)
        debug.performanceEnd(performanceMessage)
        callback(null, obj.file)
      } catch(e) {
        debug.performanceEnd(performanceMessage)
        logger.logError(e,'public');
        callback()
      }
    }),
    changedInPlace({firstPass:true}),
    prettify({indent_size: 4}),
    through2.obj(function (file, enc, callback) {
      debug.log('prettify',file.path)
      callback(null, file)
    }),
    gulp.dest('build'),
    reload({stream: true})
  )
}

gulp.task('public', () => {
  return publicFilePipe(()=> true);
})

gulp.task('assets', () => {
  return gulp.src('src/assets/**/*.*').pipe(gulp.dest('build/assets/')).pipe(reload({stream: true}))
})

gulp.task('libs', () => {
  return gulp.src('src/libs/**/*.*').pipe(gulp.dest('build/libs/')).pipe(reload({stream: true}))
})




gulp.task('serve', () => {
  browserSync({server: './build', open:false})
})

gulp.task('setWatch', function() {
    global.isWatching = true;
});

var getFileType = function(filePath){
  var relativePath = path.relative(process.cwd(), filePath)
  if(minimatch(relativePath,'src/public/**/*.*')){
    return 'public'
  }else if(minimatch(relativePath,'src/ui/components/**/*.*') || minimatch(relativePath,'src/ui/objects/**/*.*')){
    return 'component'
  }else if(minimatch(relativePath,'src/templates/**/*.*')){
    return 'template'
  }else if(minimatch(relativePath,'src/ui/*.js') || minimatch(relativePath,'src/ui/*/*.js')){
    return 'settings'
  }

}

gulp.task('watch', ['setWatch','build', 'serve'], () => {
  watch([
    'src/ui/*',
    'src/ui/tools/*.scss',
    'src/ui/general/*',
    'src/ui/basic/*',
    'src/ui/objects/**/*.scss',
    'src/ui/components/**/*.scss',
    'src/ui/trumps/*'
  ], function(file){
    requireGraph.decache(file.path)
    var style = require('../src/ui/style');
    var relativePath = path.relative(process.cwd(), file.path)
    
    logger.taskStart('styles')
    if(path.extname(file.path) == '.scss' && !minimatch(relativePath,'src/ui/tools/*.scss')) {
      return buildStyles(style.header,file.path)
    }else{
      return buildStyles(style.header, './src/ui/**/*.scss')
    }
  })
  gulp.watch([
    'src/scripts/*.*'
  ], ['scripts'])

  gulp.watch([
    'src/assets/**/*',
  ], ['assets'])
  gulp.watch([
    'src/libs/**/*',
  ], ['libs'])

  watch([
    'src/public/**/*',
    'src/templates/**/*',
    'src/ui/objects/**/*.jsx',
    'src/ui/components/**/*.jsx',
    'src/ui/*/*.js',
    'src/ui/*.js',
  ],{read:false},function(file){
    var fileType = getFileType(file.path)
    requireGraph.fileChanged(file.path)
    var currentDependencies = requireGraph.dependencies
    var isTemplateUsingComponent = R.curry((tree,template,component) => {
      if(tree[component]){
        if(tree[component][template]){
          return true
        } else if (R.is(Object,tree[component])){
          return R.any(isTemplateUsingComponent(tree,template),Object.keys(tree[component]))
        }
      }
      return false
    })

    logger.taskStart('public')
    debug.log(`watcher: ${file.event} ${file.path}`)
    publicFilePipe(function shouldBuildPublicFile(publicFile,templateFile) {
      if(fileType == 'public' && publicFile == file.path) {
        return true;
      } else if(fileType == 'settings'){
        return true;
      } else if(
        (fileType == 'component' || fileType == 'template') &&
        (templateFile == file.path || isTemplateUsingComponent(currentDependencies,templateFile,file.path))
      ) {
        return true;
      } else {
        return false;
      }
    }).on('end', logger.taskDuration('public'))
  })
})


gulp.task('clean', () => del(['./build']))
gulp.task('default',['build'])
