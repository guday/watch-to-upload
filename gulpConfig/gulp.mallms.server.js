var path = require("path");
var gulp = require("gulp");
var gutil = require("gulp-util");
var jsonlint = require("gulp-jsonlint");
var through = require("through-gulp");

var typescript = require('gulp-tsc');

var Base = require("./base");
var debug = true;
var rootPath = process.cwd();
var changedFileMap = {};
var initCompileFinished = false;

/**
 * lint
 */
gulp.task('compileTS', function () {
    let lintFiles = Base.getFiles();
    // let changedArr = Object.keys(changedFileMap);
    // if (changedArr.length) {
    //     lintFiles = changedArr;
    // }

    return gulp.src(lintFiles)
        .pipe(typescript({
            target: "es6",
            removeComments: true,
            sourceMap: false,
            emitError: false,
        }))
        .pipe(gulp.dest(path.join(rootPath, Base.getDstDir())))
        .pipe(through(function (file, encoding, callback) {
            let relative = path.relative(rootPath, file.path)
            if (debug) {
                if (initCompileFinished) {
                    gutil.log("[lint][变更]" + relative);
                    Base.addChange('change', relative);
                } else {
                    gutil.log("[lint][初始化]:" + relative);
                    Base.addChange('total', relative);
                }
            }

            callback();
        }))
        .on('end', () => {
            if (!initCompileFinished) {
                initCompileFinished = true;
            }
            Base.readLine();
        })
});


/**
 * watch
 */
gulp.task('watchTS', function () {
    let watcher = gulp.watch(Base.getFiles(), ['compileTS'])

    watcher.on('change', function (event) {
        collectWatch(event)
    });

    watcher.on('add', function (event) {
        collectWatch(event)
    });

    function collectWatch(event) {
        let {path: fullPath = "", type = ""} = event;
        if (fullPath && type) {
            let relative = path.relative(rootPath, fullPath)
            if (debug) {
                gutil.log(`[变更]:${type}` + relative);
            }
            changedFileMap[relative] = true;
        }
    }
});