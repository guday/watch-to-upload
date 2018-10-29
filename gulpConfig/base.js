var fs = require("fs");
var path = require("path");

var gulp = require("gulp");
var gutil = require("gulp-util");
var upload = require('gulp-upload');
var readline = require("readline")
var zip = require('gulp-zip');
var del = require('del');
var rootPath = process.cwd();

//服务器配置
var options = {
    // 服务器接口
    server: '127.0.0.1:8084/upload',

    // 解压文件所到的位置
    data: {
        type: "watchToUpload"
    }
}

//当前目录配置
var tempZipFileName = "tempFile";

//编译的file配置
var localConfig = {
    srcFiles: ["admin-config/**/*.json"],
    dstDir: "admin-config"
}



let collectChangeInfo = {
    total: {},
    change: {},
    add: {}
}

let timer = null;
let rl = null;

/**
 * 上传文件
 * @param filePath
 * @param callback
 */
function uploadFunc(filePath, callback) {

    let fullPath = path.join(rootPath, filePath);
    gutil.log("[UPLOAD]: begin:", fullPath)
    gutil.log(`[UPLOAD]: type:${options.data.type}; remote:${options.server}`)
    gulp.src(fullPath)
        .pipe(upload(Object.assign(options, {
            callback: (err, data) => {
                if (err) {
                    callback && callback(false, err.toString());
                } else {
                    callback && callback(true);
                }
            }
        })))
}

/**
 * 搜集要上传的文件列表
 * @param cmd
 * @returns {Array}
 */
function collectUploadFiles(cmd) {
    let zipFileMap = {};
    let keyObj = {};
    if (cmd === "1") {
        keyObj['total'] = true;
    } else if (cmd === "2") {
        for (let i in collectChangeInfo) {
            if (i !== "total") {
                keyObj[i] = true;
            }
        }
    } else if (collectChangeInfo.hasOwnProperty(cmd)) {
        keyObj[cmd] = true;
    }

    for (let i in keyObj) {
        for (let j in collectChangeInfo[i]) {
            zipFileMap[j] = true;
        }
    }
    return Object.keys(zipFileMap);
}

/**
 * 对文件进行打包
 * @param fileArr
 * @param callback
 */
function zipFiles(fileArr, callback) {
    console.log(fileArr, rootPath)

    fileArr = fileArr.map(item => {
        return path.join(rootPath, item);
    })
    gulp.src(fileArr, {base: path.join(rootPath, localConfig.dstDir)})
        .pipe(zip(`${tempZipFileName}.zip`))
        .pipe(gulp.dest(path.join(rootPath, localConfig.dstDir)))
        .on('end', () => {
            callback && callback();
        })
}

function delTempZipFile() {
    let tempFile = path.join(rootPath, localConfig.dstDir, `${tempZipFileName}.zip`)
    let result = del.sync(tempFile);
    return result && result.length;
}

/**
 * 进行问答
 */
function readLine() {
    if (timer) {
        clearTimeout(timer), timer = null;
        rl && rl.close && rl.close();
    }
    timer = setTimeout(() => {
        question();
    }, 1000)

    function question(inputStr) {
        let infoArr = []

        for (let i in collectChangeInfo) {
            infoArr.push(`${i}:${Object.keys(collectChangeInfo[i]).length}`)
        }
        let questionArr = [];
        questionArr && questionArr.push(inputStr);
        questionArr.push(` 【info】 ${infoArr.join('; ')}`)
        questionArr.push(` 键入对应的key，执行对应文件的变更上传,当前type:${options.data.type}`)
        questionArr.push(` 或者键入1，执行total的上传，键入2，执行非total的上传`)
        questionArr.push(``)

        rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        rl.question(questionArr.join('\n'), function (answer) {
            rl.close();
            if (answer === "1" || answer === "2" || collectChangeInfo.hasOwnProperty(answer)) {
                // console.log("suc:", answer)
                let uploadArr = collectUploadFiles(answer)
                if (uploadArr.length) {
                    //打包
                    zipFiles(uploadArr, () => {
                        let tempZipFile = path.join(localConfig.dstDir, tempZipFileName + ".zip");
                        gutil.log(`[ZIP]: files: ${uploadArr.length} => tempFile: ${tempZipFile}`);
                        //上传
                        uploadFunc(tempZipFile, (success, msg) => {
                            if (success) {
                                gutil.log(`[UPLOAD]: success`);
                                if (delTempZipFile()) {
                                    gutil.log(`[ZIP]: del tempFile: ${tempZipFile}`);
                                }
                            } else {
                                gutil.log(`[UPLOAD]: fail ${msg}`);
                                question(` 【info】上传失败，请确认配置或者环境没问题后重试\n`)
                            }
                        })
                    });
                } else {
                    question(` 【info】选项" ${answer} "找到0个待上传文件，请重新输入\n`)
                }
            } else {
                question(" 【info】错误的输入，请重新输入\n");
            }
            timer = null;
        });
    }
}

/**
 * 初始化配置
 * @param param
 */
function initConfig(param) {
    if (param) {
        if (param.type) {
            options.data.type = param.type
        }
        if (param.server) {
            options.server = param.server
        }
        if (param.tempZipFileName) {
            tempZipFileName = param.tempZipFileName
        }
        if (param.compileFiles) {
            localConfig.srcFiles = param.compileFiles
        }
        if (param.dstDir) {
            localConfig.dstDir = param.dstDir
        }
    }

}

/**
 * 变更文件的路径搜集
 * @param type 类型  total, add, change
 * @param relativePath 相对执行根路径
 */
function addChange(type, relativePath) {
    collectChangeInfo[type] = collectChangeInfo[type] || {};
    collectChangeInfo[type][relativePath] = +new Date();
}


/**
 * 取得需要编译的文件
 * @returns {Array}
 */
function getFiles() {
    return localConfig.srcFiles;
}

/**
 * 取得需要编译的文件
 * @returns {Array}
 */
function getDstDir() {
    return localConfig.dstDir;
}

exports.readLine = readLine;
exports.addChange = addChange;
exports.initConfig = initConfig;
exports.getFiles = getFiles;
exports.getDstDir = getDstDir;
