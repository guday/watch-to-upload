var gulpSequence = require('gulp-sequence')
require('./gulpConfig/gulp.config')
require('./gulpConfig/gulp.mallms.server')
var gulp = require("gulp");
var Base = require('./gulpConfig/base')

//===========watchToUpload 后台资源===================//
gulp.task('watchToUploadConfig', (cb) => {
    Base.initConfig({
        tempZipFileName: "tempFile",
        compileFiles: ['src/**/*.ts', '!src/.*'],
        dstDir: "dest",
        type: "watchToUpload",
        server: "127.0.0.1:8084/upload"
    })
    cb();
})




gulp.task('watchToUpload', gulpSequence(['watchToUploadConfig'], 'compileTS', 'watchTS'))

