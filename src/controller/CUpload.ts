import {NextFunction, Response} from "express";
import {MyError, ERR_MSG} from "../common/MyError";
import {Request} from "../interface/ICommon"

var process = require('child_process');
var Log = require("log4js").getLogger("[CCommonOperate]");

var cmdInfo = {
  //watchToUpload本身的服务
  "watchToUpload": {
    dirName: "/Users/seraphtaotao/Documents/selfCode/hjApp/watch-to-upload/storage",
    restart: "pm2 startOrRestart /Users/seraphtaotao/Documents/selfCode/hjApp/watch-to-upload/bin/ecosystem.config.js"
  }
}

/**
 * Constructor
 *
 * @class BaseRoute
 */
export class CUpload {

  constructor() {

  }

  /**
   * 通用操作 函数
   * @param {Promise<any>} authPromise
   * @param {Request} req
   * @param {e.Response} res
   * @param {e.NextFunction} next
   */
  public operate(req: Request, res: Response, next: NextFunction) {
    let ret = async () => {

      // Log.info("operate")
      //1. 解析参数

      return await this.processFile(req);

    };
    next(ret());
  }

  /**
   * 接受文件
   * @param {Request} req
   * @returns {Promise<any>}
   */
  private async processFile(req: Request) {
    let body = req.body || {};
    return new Promise((resolve, reject) => {
      let {type = ''} = body || {};
      if (!type || !cmdInfo.hasOwnProperty(type) || !cmdInfo[type]) {
        reject(MyError.create(ERR_MSG.PARAM_ERROR))
        return;
      }
      let {dirName = "", restart = ""} = cmdInfo[type]
      if (!dirName || !restart) {
        reject(MyError.create(ERR_MSG.CONFIG_ERROR))
        return;
      }
      req.file('file').upload((err, uploadedFiles) => {
        if (err) {
          reject(MyError.create(ERR_MSG.SYS_ERROR, err))
          return;
        }

        if (uploadedFiles && uploadedFiles.length === 1) {
          let fileInfo = uploadedFiles[0];
          if (fileInfo.fd && fileInfo.size && fileInfo.type.indexOf('zip') > -1 && fileInfo.filename.lastIndexOf('zip') > -1) {
            process.exec(`unzip -o ${fileInfo.fd} -d ${dirName}/`, function (error, stdout, stderr) {
              if (error !== null) {
                reject(MyError.create(ERR_MSG.UNZIP_ERROR, error))
                return;
              }

              process.exec(restart, function (error, stdout, stderr) {
                if (error !== null) {
                  reject(MyError.create(ERR_MSG.RESTART_ERROR, error))
                  return;
                }
                if (type !== "watchToUpload") {
                  resolve("success");
                }
              });
              // watchToUpload 业务本身的重启，会导致业务返回失败，导致前端gulp脚本失败，失去响应
              if (type === "watchToUpload") {
                resolve("success");
              }
            });
          } else {
            reject(MyError.create(ERR_MSG.PARAM_ERROR, err))
            return;
          }
        } else {
          reject(MyError.create(ERR_MSG.PARAM_ERROR, err))
          return;
        }
      });
    })
  }

  /**
   * 通用操作 函数
   * @param {Promise<any>} authPromise
   * @param {Request} req
   * @param {e.Response} res
   * @param {e.NextFunction} next
   */
  public test(req: Request, res: Response, next: NextFunction) {
    let ret = async () => {


      Log.info("test")
      //1. 解析参数
      let {extra = {}} = req.body;
      let {sqlData = {}, routeFuncName = ''} = extra;
      Log.info("operate", JSON.stringify(extra))
      let {table = "", type: sqlType = ""} = sqlData;
      return 'test'


    };
    next(ret());
  }


}
