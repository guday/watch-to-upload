var path = require("path");
var gulp = require("gulp");
var gutil = require("gulp-util");
var jsonlint = require("gulp-jsonlint");
var through = require("through-gulp");

var Base = require("./base");
var debug = true;
var rootPath = process.cwd();
var changedFileMap = {};

/**
 * lint
 */
gulp.task('lintConfig', function () {
    let lintFiles = Base.getFiles();
    let changedArr = Object.keys(changedFileMap);
    if (changedArr.length) {
        lintFiles = changedArr;
    }
    return gulp.src(lintFiles)
        .pipe(jsonlint())
        .pipe(jsonlint.reporter())
        .pipe(through(function (file, encoding, callback) {
            let relative = path.relative(rootPath, file.path)
            if (debug) {
                gutil.log((changedArr.length ? "[lint][变更]" : "[lint][初始化]:") + relative);
            }
            Base.addChange('total', relative)
            callback();
        }))
        .on('end', () => {
            Base.readLine();
        })
});


/**
 * watch
 */
gulp.task('watchConfig', function () {
    let watcher = gulp.watch(Base.getFiles(), ['lintConfig'])

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
            Base.addChange(type, relative);
            changedFileMap[relative] = true;
        }
    }
});